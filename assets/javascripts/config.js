const meta = document.querySelector('meta[name="api-base-url"]');
const base = meta?.content || "http://localhost:8080";

window.API_BASE = base;

window.ENDPOINTS = Object.freeze({
  LIST_BENCHMARKS:  `${window.API_BASE}/benchmarks/list`,
  LIST_METRICS:     `${window.API_BASE}/metrics/list`,
  LIST_TESTS:       `${window.API_BASE}/tests/info`,
  ASSESS_BENCHMARK: `${window.API_BASE}/assess/benchmark`,
  ASSESS_TEST:      `${window.API_BASE}/assess/test`
});
