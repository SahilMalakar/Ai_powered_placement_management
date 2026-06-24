package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

const baseURL = "http://localhost:5000"

// A valid JWT. Log in once, paste the token here.
const authToken = "Bearer <paste-your-jwt-here>"

// Login credentials for the auth load test
var loginBody = map[string]string{
	"email":    "student@example.com",
	"password": "yourpassword",
}

// A student ID that exists in your DB (for the preview route)
const studentPreviewID = "clxyz123"

// A placement drive ID that exists (for CSV export trigger)
const driveID = "clxyz456"

// ────────────────────────────────────────────────────────────────
// ANSI COLORS (no external deps)
// ────────────────────────────────────────────────────────────────

const (
	ansiReset   = "\033[0m"
	ansiBold    = "\033[1m"
	ansiCyan    = "\033[36m"
	ansiGreen   = "\033[32m"
	ansiYellow  = "\033[33m"
	ansiRed     = "\033[31m"
	ansiMagenta = "\033[35m"
)

func cyan(s string) string    { return ansiCyan + s + ansiReset }
func bold(s string) string    { return ansiBold + s + ansiReset }
func green(s string) string   { return ansiGreen + s + ansiReset }
func yellow(s string) string  { return ansiYellow + s + ansiReset }
func red(s string) string     { return ansiRed + s + ansiReset }
func magenta(s string) string { return ansiMagenta + s + ansiReset }

// ────────────────────────────────────────────────────────────────
// PROGRESS BAR (inline, no deps)
// ────────────────────────────────────────────────────────────────

type progress struct {
	total   int64
	current int64
	mu      sync.Mutex
}

func newProgress(total int) *progress { return &progress{total: int64(total)} }

func (p *progress) inc() {
	n := atomic.AddInt64(&p.current, 1)
	p.mu.Lock()
	defer p.mu.Unlock()
	pct := float64(n) / float64(p.total)
	filled := int(pct * 40)
	bar := ""
	for i := 0; i < 40; i++ {
		if i < filled {
			bar += "█"
		} else {
			bar += "░"
		}
	}
	fmt.Printf("\r  [%s] %d/%d", cyan(bar), n, p.total)
	if n == p.total {
		fmt.Println()
	}
}

// ────────────────────────────────────────────────────────────────
// RESULT
// ────────────────────────────────────────────────────────────────

type Result struct {
	Latency    time.Duration
	StatusCode int
	Err        error
}

// ────────────────────────────────────────────────────────────────
// HTTP CLIENT
// ────────────────────────────────────────────────────────────────

func newClient(timeout time.Duration) *http.Client {
	return &http.Client{
		Timeout: timeout,
		Transport: &http.Transport{
			MaxIdleConns:        500,
			MaxIdleConnsPerHost: 500,
			IdleConnTimeout:     90 * time.Second,
			DisableKeepAlives:   false,
		},
	}
}

// ────────────────────────────────────────────────────────────────
// WORKER POOL
// ────────────────────────────────────────────────────────────────

type Job func() Result

func runPool(ctx context.Context, jobs []Job, workers int) []Result {
	jobCh := make(chan Job, len(jobs))
	for _, j := range jobs {
		jobCh <- j
	}
	close(jobCh)

	resultCh := make(chan Result, len(jobs))
	bar := newProgress(len(jobs))
	var wg sync.WaitGroup

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-jobCh:
					if !ok {
						return
					}
					resultCh <- job()
					bar.inc()
				}
			}
		}()
	}

	wg.Wait()
	close(resultCh)

	var results []Result
	for r := range resultCh {
		results = append(results, r)
	}
	return results
}

// ────────────────────────────────────────────────────────────────
// STATS ENGINE
// ────────────────────────────────────────────────────────────────

type Stats struct {
	Total   int
	Success int
	Client  int
	Server  int
	NetErr  int
	Avg     time.Duration
	Min     time.Duration
	Max     time.Duration
	P50     time.Duration
	P90     time.Duration
	P95     time.Duration
	P99     time.Duration
	RPS     float64
	Elapsed time.Duration
	Buckets map[string]int
}

var bucketOrder = []string{"<50ms", "<100ms", "<200ms", "<500ms", "<1000ms", ">1000ms"}

func computeStats(results []Result, elapsed time.Duration) Stats {
	s := Stats{
		Total:   len(results),
		Elapsed: elapsed,
		Buckets: map[string]int{},
	}
	for _, k := range bucketOrder {
		s.Buckets[k] = 0
	}

	if s.Total == 0 {
		return s
	}

	var latencies []time.Duration
	var totalLat time.Duration
	s.Min = time.Duration(math.MaxInt64)

	for _, r := range results {
		switch {
		case r.Err != nil:
			s.NetErr++
		case r.StatusCode >= 200 && r.StatusCode < 300:
			s.Success++
		case r.StatusCode >= 400 && r.StatusCode < 500:
			s.Client++
		case r.StatusCode >= 500:
			s.Server++
		}

		if r.Err == nil {
			latencies = append(latencies, r.Latency)
			totalLat += r.Latency
			if r.Latency < s.Min {
				s.Min = r.Latency
			}
			if r.Latency > s.Max {
				s.Max = r.Latency
			}
			switch {
			case r.Latency < 50*time.Millisecond:
				s.Buckets["<50ms"]++
			case r.Latency < 100*time.Millisecond:
				s.Buckets["<100ms"]++
			case r.Latency < 200*time.Millisecond:
				s.Buckets["<200ms"]++
			case r.Latency < 500*time.Millisecond:
				s.Buckets["<500ms"]++
			case r.Latency < 1000*time.Millisecond:
				s.Buckets["<1000ms"]++
			default:
				s.Buckets[">1000ms"]++
			}
		}
	}

	if len(latencies) > 0 {
		s.Avg = totalLat / time.Duration(len(latencies))
		sort.Slice(latencies, func(i, j int) bool { return latencies[i] < latencies[j] })
		s.P50 = pctile(latencies, 50)
		s.P90 = pctile(latencies, 90)
		s.P95 = pctile(latencies, 95)
		s.P99 = pctile(latencies, 99)
	}

	if elapsed > 0 {
		s.RPS = float64(s.Total) / elapsed.Seconds()
	}
	return s
}

func pctile(sorted []time.Duration, p float64) time.Duration {
	idx := int(math.Ceil(p/100*float64(len(sorted)))) - 1
	if idx < 0 {
		idx = 0
	}
	return sorted[idx]
}

func pct(n, total int) float64 {
	if total == 0 {
		return 0
	}
	return float64(n) / float64(total) * 100
}

// ────────────────────────────────────────────────────────────────
// PRINT
// ────────────────────────────────────────────────────────────────

func printHeader(title string) {
	fmt.Println()
	fmt.Println(cyan("  ══════════════════════════════════════════"))
	fmt.Printf(cyan("  %s\n"), title)
	fmt.Println(cyan("  ══════════════════════════════════════════"))
}

func printStats(s Stats) {
	div := bold("  ├──────────────────────────────────────────┤")
	top := bold("  ┌──────────────────────────────────────────┐")
	bot := bold("  └──────────────────────────────────────────┘")

	fmt.Println()
	fmt.Println(top)
	fmt.Printf(bold("  │  %-41s│\n"), "RESULTS")
	fmt.Println(div)
	fmt.Printf("  │  Total Requests  : %-22d│\n", s.Total)
	fmt.Printf("  │  Elapsed         : %-22s│\n", s.Elapsed.Round(time.Millisecond))
	fmt.Printf("  │  RPS             : %-22.1f│\n", s.RPS)
	fmt.Println(div)
	fmt.Printf(green("  │  2xx Success     : %-5d  (%.1f%%)          │\n"), s.Success, pct(s.Success, s.Total))
	fmt.Printf(yellow("  │  4xx Client Err  : %-5d  (%.1f%%)          │\n"), s.Client, pct(s.Client, s.Total))
	fmt.Printf(red("  │  5xx Server Err  : %-5d  (%.1f%%)          │\n"), s.Server, pct(s.Server, s.Total))
	fmt.Printf(red("  │  Net Errors      : %-5d  (%.1f%%)          │\n"), s.NetErr, pct(s.NetErr, s.Total))
	fmt.Println(div)
	fmt.Printf("  │  Latency                                 │\n")
	fmt.Printf("  │    Avg  : %-31s│\n", s.Avg.Round(time.Millisecond))
	fmt.Printf("  │    Min  : %-31s│\n", s.Min.Round(time.Millisecond))
	fmt.Printf("  │    p50  : %-31s│\n", s.P50.Round(time.Millisecond))
	fmt.Printf("  │    p90  : %-31s│\n", s.P90.Round(time.Millisecond))
	fmt.Printf(magenta("  │    p95  : %-31s│\n"), s.P95.Round(time.Millisecond))
	fmt.Printf(red("  │    p99  : %-31s│\n"), s.P99.Round(time.Millisecond))
	fmt.Printf("  │    Max  : %-31s│\n", s.Max.Round(time.Millisecond))
	fmt.Println(div)
	fmt.Printf("  │  Latency Distribution                    │\n")
	for _, bucket := range bucketOrder {
		n := s.Buckets[bucket]
		filled := 0
		if s.Total > 0 {
			filled = int(float64(n) / float64(s.Total) * 16)
		}
		bar := ""
		for i := 0; i < 16; i++ {
			if i < filled {
				bar += "█"
			} else {
				bar += "░"
			}
		}
		fmt.Printf("  │  %-8s %s  %3.0f%%              │\n", bucket, bar, pct(n, s.Total))
	}
	fmt.Println(bot)
}

// ────────────────────────────────────────────────────────────────
// TEST 1 — JOB LISTINGS  (read-heavy spike)
//
// Simulates the "results announced" moment: every student
// refreshes the job board simultaneously.
//
// What to look for:
//   - p99 spiking as Prisma queues up DB queries
//   - 5xx errors when the DB connection pool exhausts
//   - Use this to tune: datasource { pool_timeout, connection_limit }
// ────────────────────────────────────────────────────────────────

func testJobListings() {
	printHeader("TEST 1 · Job Listings  (read-heavy spike)")

	const (
		requests = 300
		workers  = 50
	)

	fmt.Printf(yellow("  Scenario  : %d concurrent students hitting GET /job-listings\n"), workers)
	fmt.Println(yellow("  Goal      : find the DB connection pool ceiling"))
	fmt.Println(yellow("  Watch for : p99 spike + 5xx when pool exhausts"))
	fmt.Println()

	client := newClient(10 * time.Second)
	ctx := context.Background()

	jobs := make([]Job, requests)
	for i := range jobs {
		jobs[i] = func() Result {
			start := time.Now()
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet,
				baseURL+"/api/placements/listings", nil)
			req.Header.Set("Authorization", authToken)

			resp, err := client.Do(req)
			if err != nil {
				return Result{Latency: time.Since(start), Err: err}
			}
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
			return Result{Latency: time.Since(start), StatusCode: resp.StatusCode}
		}
	}

	start := time.Now()
	results := runPool(ctx, jobs, workers)
	elapsed := time.Since(start)

	s := computeStats(results, elapsed)
	printStats(s)

	if s.Server > 0 || s.NetErr > 0 {
		fmt.Printf(yellow("\n  ⚠  %d errors at %d workers.\n"), s.Server+s.NetErr, workers)
		fmt.Println(yellow("     Fix: set DATABASE_URL connection_limit in your Prisma URL, e.g.:"))
		fmt.Println(yellow("     postgresql://user:pass@host/db?connection_limit=20&pool_timeout=10"))
	} else {
		fmt.Printf(green("\n  ✓  Zero errors at %d concurrent workers. Pool held.\n"), workers)
	}
}

// ────────────────────────────────────────────────────────────────
// TEST 2 — STUDENT PREVIEW  (Redis cache race / thundering herd)
//
// All goroutines start simultaneously via a shared channel.
// On a cold cache, many requests miss at the same time and all
// hit the DB before the first one writes back to Redis.
//
// Phase A = cold burst (stampede)
// Phase B = warm sequential (baseline)
//
// What to look for:
//   - Cold p99 >> warm p99 → stampede confirmed
//   - 5xx during cold phase → DB overwhelmed
//   - Fix: use a singleflight.Group in your cache-miss handler
// ────────────────────────────────────────────────────────────────

func testStudentPreview() {
	printHeader("TEST 2 · Student Preview  (Redis cache thundering herd)")

	const burstWorkers = 40

	fmt.Printf(yellow("  Scenario  : %d goroutines all fetching the same student at once\n"), burstWorkers)
	fmt.Println(yellow("  Goal      : trigger cache stampede, expose thundering herd on DB"))
	fmt.Println(yellow("  Watch for : cold p99 >> warm p99, 5xx on cold burst"))
	fmt.Println()

	client := newClient(10 * time.Second)
	ctx := context.Background()

	url := fmt.Sprintf("%s/api/students/%s/preview", baseURL, studentPreviewID)

	// ── Phase A: cold cache burst ──────────────────────────────
	// (flush your Redis key manually before running if you want a clean test:
	//  redis-cli DEL student:preview:<studentPreviewID>)
	fmt.Println("  Phase A: cold-cache burst — all goroutines fire simultaneously")

	var (
		coldResults []Result
		mu          sync.Mutex
		wg          sync.WaitGroup
		coldBar     = newProgress(burstWorkers)
	)

	ready := make(chan struct{}) // synchronisation gate — maximises stampede chance

	for i := 0; i < burstWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-ready // block until all goroutines are spawned
			start := time.Now()
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
			req.Header.Set("Authorization", authToken)

			resp, err := client.Do(req)
			lat := time.Since(start)
			coldBar.inc()

			r := Result{Latency: lat}
			if err != nil {
				r.Err = err
			} else {
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
				r.StatusCode = resp.StatusCode
			}
			mu.Lock()
			coldResults = append(coldResults, r)
			mu.Unlock()
		}()
	}

	startCold := time.Now()
	close(ready) // release all goroutines at once
	wg.Wait()
	elapsedCold := time.Since(startCold)
	coldStats := computeStats(coldResults, elapsedCold)
	printStats(coldStats)

	// ── Phase B: warm cache sequential ────────────────────────
	fmt.Println("\n  Phase B: warm-cache sequential (cache should be populated now)")

	warmJobs := make([]Job, 50)
	for i := range warmJobs {
		warmJobs[i] = func() Result {
			start := time.Now()
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
			req.Header.Set("Authorization", authToken)

			resp, err := client.Do(req)
			if err != nil {
				return Result{Latency: time.Since(start), Err: err}
			}
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
			return Result{Latency: time.Since(start), StatusCode: resp.StatusCode}
		}
	}

	startWarm := time.Now()
	warmResults := runPool(ctx, warmJobs, 10)
	elapsedWarm := time.Since(startWarm)
	warmStats := computeStats(warmResults, elapsedWarm)
	printStats(warmStats)

	// ── Delta report ───────────────────────────────────────────
	fmt.Println("\n  Cache effectiveness:")
	fmt.Printf("    Cold p99 → %s\n", coldStats.P99.Round(time.Millisecond))
	fmt.Printf("    Warm p99 → %s\n", warmStats.P99.Round(time.Millisecond))
	if warmStats.P99 > 0 {
		speedup := float64(coldStats.P99) / float64(warmStats.P99)
		fmt.Printf(green("    Speedup  → %.1fx\n"), speedup)
	}
	if coldStats.Server > 0 {
		fmt.Printf(red("\n  ⚠  %d 5xx during cold burst — DB hit during stampede.\n"), coldStats.Server)
		fmt.Println(red("     Fix: wrap your cache-miss DB call in golang.org/x/sync/singleflight"))
		fmt.Println(red("     (or the Node equivalent: async-singleflight / p-limit(1) per key)"))
	} else {
		fmt.Println(green("\n  ✓  No 5xx on cold burst. Cache or DB handled the stampede cleanly."))
	}
}

// ────────────────────────────────────────────────────────────────
// TEST 3 — LOGIN / AUTH  (CPU-bound bcrypt degradation)
//
// bcrypt is intentionally slow (cost factor ~10–12 = ~100–300ms).
// Under concurrency it saturates CPU cores, NOT I/O slots.
// Latency grows linearly with workers — that is expected.
//
// This test ramps workers: 5 → 10 → 20 → 40 so you can see
// exactly where your Node event loop starts to visibly degrade.
//
// What to look for:
//   - Latency roughly doubling each time workers double
//   - The concurrency level where p99 becomes unacceptable
//   - Fix: rate-limit /auth/login per IP (e.g. express-rate-limit)
//   - Fix: offload bcrypt.compare to a worker_threads pool
// ────────────────────────────────────────────────────────────────

func testLogin() {
	printHeader("TEST 3 · Login / Auth  (bcrypt CPU degradation)")

	fmt.Println(yellow("  Scenario  : ramp workers 5 → 10 → 20 → 40"))
	fmt.Println(yellow("  Goal      : show bcrypt latency scaling with concurrency"))
	fmt.Println(yellow("  Watch for : p99 roughly doubles as workers double (CPU-bound)"))
	fmt.Println()

	client := newClient(30 * time.Second) // bcrypt is slow — give it time
	ctx := context.Background()

	body, _ := json.Marshal(loginBody)

	makeLoginJob := func() Result {
		start := time.Now()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost,
			baseURL+"/api/auth/login",
			bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			return Result{Latency: time.Since(start), Err: err}
		}
		io.Copy(io.Discard, resp.Body)
		resp.Body.Close()
		return Result{Latency: time.Since(start), StatusCode: resp.StatusCode}
	}

	type levelResult struct {
		workers int
		s       Stats
	}
	var levels []levelResult

	for _, workers := range []int{5, 10, 20, 40} {
		const reqs = 30
		fmt.Printf("  ── Workers: %-3d  (%d requests)\n", workers, reqs)
		jobs := make([]Job, reqs)
		for i := range jobs {
			jobs[i] = makeLoginJob
		}
		start := time.Now()
		results := runPool(ctx, jobs, workers)
		elapsed := time.Since(start)
		s := computeStats(results, elapsed)
		levels = append(levels, levelResult{workers, s})

		line := fmt.Sprintf("    Avg: %-10s  p95: %-10s  p99: %-10s  RPS: %.1f",
			s.Avg.Round(time.Millisecond),
			s.P95.Round(time.Millisecond),
			s.P99.Round(time.Millisecond),
			s.RPS,
		)
		if s.NetErr > 0 || s.Server > 0 {
			fmt.Println(red(line))
			fmt.Printf(red("    ⚠  Errors: net=%d  5xx=%d\n"), s.NetErr, s.Server)
		} else {
			fmt.Println(line)
		}
	}

	// Show p99 growth across ramp levels
	fmt.Println("\n  p99 ramp-up summary:")
	for _, l := range levels {
		bar := ""
		ms := int(l.s.P99.Milliseconds())
		barLen := ms / 20 // 1 char per 20ms
		if barLen > 40 {
			barLen = 40
		}
		for i := 0; i < barLen; i++ {
			bar += "█"
		}
		fmt.Printf("    %2d workers  %s  %s\n",
			l.workers,
			fmt.Sprintf("%-40s", bar),
			magenta(l.s.P99.Round(time.Millisecond).String()),
		)
	}
	fmt.Println()
	fmt.Println("  If p99 doubles each time workers double → bcrypt is CPU-saturating.")
	fmt.Println("  Recommendation: express-rate-limit on /auth/login (max 10 req/min per IP)")
}

// ────────────────────────────────────────────────────────────────
// TEST 4 — CSV EXPORT BURST  (BullMQ queue depth / worker lag)
//
// The HTTP response is cheap — it just calls queue.add().
// We're stress-testing what happens to BullMQ + Redis when
// 20 jobs land simultaneously.
//
// What to look for:
//   - All 202s → your queue accepted every job (good, but check worker lag)
//   - 429s → you have rate limiting in place (ideal)
//   - 5xx → something in your enqueue path is broken under burst
//   - After the test: open Bull Dashboard or run:
//       redis-cli LLEN bull:csv-export:wait
//     to see queue depth. If it's growing faster than the worker
//     drains it, your concurrency setting is too low.
// ────────────────────────────────────────────────────────────────

func testCSVExport() {
	printHeader("TEST 4 · CSV Export Burst  (BullMQ queue depth)")

	const burstSize = 20

	fmt.Printf(yellow("  Scenario  : %d export requests fired simultaneously\n"), burstSize)
	fmt.Println(yellow("  Goal      : stress BullMQ concurrency + Redis enqueue path"))
	fmt.Println(yellow("  Watch for : 429 (queue full), 5xx (enqueue error), zero rate limiting"))
	fmt.Println()

	client := newClient(10 * time.Second)
	ctx := context.Background()

	var (
		enqueued  int64 // 202
		throttled int64 // 429
		failed    int64 // other
	)

	exportBody, _ := json.Marshal(map[string]interface{}{
		"driveId": driveID,
		"fields":  []string{"name", "rollNo", "branch", "cgpa", "phone"},
	})

	jobs := make([]Job, burstSize)
	for i := range jobs {
		jobs[i] = func() Result {
			start := time.Now()
			req, _ := http.NewRequestWithContext(ctx, http.MethodPost,
				baseURL+"/api/exports/trigger",
				bytes.NewReader(exportBody))
			req.Header.Set("Authorization", authToken)
			req.Header.Set("Content-Type", "application/json")

			resp, err := client.Do(req)
			if err != nil {
				atomic.AddInt64(&failed, 1)
				return Result{Latency: time.Since(start), Err: err}
			}
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()

			switch resp.StatusCode {
			case 202:
				atomic.AddInt64(&enqueued, 1)
			case 429:
				atomic.AddInt64(&throttled, 1)
			default:
				atomic.AddInt64(&failed, 1)
			}
			return Result{Latency: time.Since(start), StatusCode: resp.StatusCode}
		}
	}

	start := time.Now()
	results := runPool(ctx, jobs, burstSize) // all at once
	elapsed := time.Since(start)

	printStats(computeStats(results, elapsed))

	fmt.Println("\n  Enqueue breakdown:")
	fmt.Printf(green("    Accepted (202)   : %d\n"), enqueued)
	fmt.Printf(yellow("    Throttled (429)  : %d\n"), throttled)
	fmt.Printf(red("    Failed (other)   : %d\n"), failed)

	if throttled == 0 {
		fmt.Println()
		fmt.Println(yellow("  ⚠  Zero 429s — your export route has no rate limiting."))
		fmt.Println(yellow("     A student (or a bug) can enqueue hundreds of jobs in one second."))
		fmt.Println(yellow("     Consider: one active export job per user at a time (check DB before enqueue)"))
		fmt.Println(yellow("     Or:       per-user rate limit via express-rate-limit on this route"))
	} else {
		fmt.Printf(green("\n  ✓  Rate limiting is active — %d requests throttled.\n"), throttled)
	}

	if enqueued > 0 {
		fmt.Printf("\n  Now check your BullMQ worker logs.\n")
		fmt.Printf("  Queue depth:  redis-cli LLEN bull:csv-export:wait\n")
		fmt.Printf("  Active jobs:  redis-cli LLEN bull:csv-export:active\n")
		fmt.Printf("  Failed jobs:  redis-cli LLEN bull:csv-export:failed\n")
		fmt.Printf("  If the wait list is growing → increase worker concurrency in your processor.\n")
	}
}

// ────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────

func main() {
	fmt.Print(cyan("\n  ██████████ GOJO ██████████\n"))
	fmt.Print(cyan("  PlacementCube Load Test Suite\n"))
	fmt.Print(cyan("  \"Limitless Load Testing\"\n\n"))
	fmt.Printf("  Target : %s\n", baseURL)
	fmt.Printf("  Time   : %s\n\n", time.Now().Format("2006-01-02 15:04:05"))

	if authToken == "Bearer <paste-your-jwt-here>" {
		fmt.Println(red("  ✗  Set authToken at the top of the file before running."))
		os.Exit(1)
	}

	testJobListings()
	testStudentPreview()
	testLogin()
	testCSVExport()

	fmt.Println()
	fmt.Println(cyan("  ══════════════════════════════════════════"))
	fmt.Println(cyan("  All scenarios complete."))
	fmt.Println(cyan("  ══════════════════════════════════════════"))
	fmt.Println()
}
