// status_lists.js

async function fetchList(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data) ? data : (data.items || data.results || []);
}

async function loadBenchmarksList() {
  const statusEl = document.getElementById('status-benchmarks-status');
  const tableEl  = document.getElementById('benchmarks-table');
  if (!tableEl) return;
  try {
    statusEl.textContent = 'Loading benchmarks…';
    const list = await fetchList(window.ENDPOINTS.LIST_BENCHMARKS);
    const { dataTable, escapeHtml, badge } = window.Components;
    dataTable(tableEl, list, [
      { key: 'title',       title: 'Title',       sortable: true,  value: (m) => escapeHtml(m.title || '') },
      { key: 'version',     title: 'Version',     sortable: true,  value: (m) => escapeHtml(m.version || '') },
      { key: 'status',      title: 'Status',      sortable: true,  value: (m) => m.status ? badge(m.status, String(m.status).toUpperCase() === 'ACTIVE' ? 'ok' : 'warn') : '' },
      { key: 'description', title: 'Description', sortable: false, value: (m) => m.description ? `<div class="wrap-text">${escapeHtml(m.description)}</div>` : '' }
    ], { searchable: true, paginated: true, pageSize: 10 });
    statusEl.textContent = `Found ${list.length} benchmark(s).`;
  } catch (err) {
    statusEl.innerHTML = `<span class="err">Error: ${window.Components.escapeHtml(err.message)}</span>`;
  }
}

async function loadMetricsList() {
  const statusEl = document.getElementById('status-metrics-status');
  const tableEl  = document.getElementById('metrics-table');
  if (!tableEl) return;
  try {
    statusEl.textContent = 'Loading metrics…';
    const [metricsResp, testsResp] = await Promise.all([
      fetch(window.ENDPOINTS.LIST_METRICS),
      fetch(window.ENDPOINTS.LIST_TESTS)
    ]);
    if (!metricsResp.ok) throw new Error(`Metrics HTTP ${metricsResp.status}`);
    if (!testsResp.ok)   throw new Error(`Tests HTTP ${testsResp.status}`);

    const metricsRaw = await metricsResp.json();
    const testsRaw   = await testsResp.json();
    const metrics = Array.isArray(metricsRaw) ? metricsRaw : (metricsRaw.items || metricsRaw.results || []);
    const tests   = Array.isArray(testsRaw)   ? testsRaw   : (testsRaw.items   || testsRaw.results   || []);

    const testTitleById = Object.create(null);
    const testUrlById   = Object.create(null);
    tests.forEach(t => {
      const id = t.id ?? t.key ?? t.slug;
      if (!id) return;
      testTitleById[id] = t.title || `Test ${id}`;
      if (t.endpointURL) testUrlById[id] = t.endpointURL;
    });

    const { dataTable, escapeHtml, badge } = window.Components;

    const extractId = (v) => {
      const s = String(v ?? '');
      const m = s.match(/\/([^\/?#]+)(?:[?#].*)?$/);
      return m ? m[1] : s;
    };

    const renderTestChips = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return '';
      return arr.map(x => {
        const id    = extractId(x);
        const title = testTitleById[id] || id;
        const href  = testUrlById[id];
        const label = escapeHtml(title);
        return href
          ? `<a class="chip" href="${escapeHtml(href)}" target="_blank" rel="noopener">${label}</a>`
          : `<span class="chip">${label}</span>`;
      }).join(' ');
    };

    dataTable(tableEl, metrics, [
      { key: 'title',       title: 'Title',       sortable: true,  value: (m) => escapeHtml(m.title || '') },
      { key: 'version',     title: 'Version',     sortable: true,  value: (m) => escapeHtml(m.version || '') },
      { key: 'status',      title: 'Status',      sortable: true,  value: (m) => m.status ? badge(m.status, String(m.status).toUpperCase() === 'ACTIVE' ? 'ok' : 'warn') : '' },
      { key: 'tests',       title: 'Tests',       sortable: false, value: (m) => renderTestChips(m.testAssociated) },
      { key: 'description', title: 'Description', sortable: false, value: (m) => m.description ? `<div class="wrap-text">${escapeHtml(m.description)}</div>` : '' }
    ], { searchable: true, paginated: true, pageSize: 10 });

    statusEl.textContent = `Found ${metrics.length} metric(s).`;
  } catch (err) {
    statusEl.innerHTML = `<span class="err">Error: ${window.Components.escapeHtml(err.message)}</span>`;
  }
}

async function loadTestsList() {
  const statusEl = document.getElementById('status-tests-status');
  const tableEl  = document.getElementById('tests-table');
  if (!tableEl) return;
  try {
    statusEl.textContent = 'Loading tests…';
    const list = await fetchList(window.ENDPOINTS.LIST_TESTS);
    const { dataTable, escapeHtml, badge } = window.Components;
    dataTable(tableEl, list, [
      { key: 'title',       title: 'Title',       sortable: true,  value: (m) => escapeHtml(m.title || '') },
      { key: 'version',     title: 'Version',     sortable: true,  value: (m) => escapeHtml(m.version || '') },
      { key: 'status',      title: 'Status',      sortable: true,  value: (m) => m.status ? badge(m.status, String(m.status).toUpperCase() === 'ACTIVE' ? 'ok' : 'warn') : '' },
      { key: 'description', title: 'Description', sortable: false, value: (m) => m.description ? `<div class="wrap-text">${escapeHtml(m.description)}</div>` : '' }
    ], { searchable: true, paginated: true, pageSize: 10 });
    statusEl.textContent = `Found ${list.length} test(s).`;
  } catch (err) {
    statusEl.innerHTML = `<span class="err">Error: ${window.Components.escapeHtml(err.message)}</span>`;
  }
}

window.StatusLists = { loadBenchmarksList, loadMetricsList, loadTestsList };
