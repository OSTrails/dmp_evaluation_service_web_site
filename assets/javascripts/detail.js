// detail.js — renders a single benchmark / metric / test from ?type=…&id=…

(function () {
  // Per-type config: where to fetch, which keys link to other entities
  const TYPES = {
    benchmark: {
      label: 'Benchmark', tab: 'benchmarks',
      list: () => window.ENDPOINTS.LIST_BENCHMARKS,
      record: () => window.ENDPOINTS.BENCHMARKS,
      relations: [
        { key: 'hasAssociatedMetric', title: 'Associated metrics', type: 'metric' }
      ]
    },
    metric: {
      label: 'Metric', tab: 'metrics',
      list: () => window.ENDPOINTS.LIST_METRICS,
      record: () => window.ENDPOINTS.METRICS,
      relations: [
        { key: 'hasBenchmark',   title: 'Benchmarks',       type: 'benchmark' },
        { key: 'testAssociated', title: 'Associated tests', type: 'test' }
      ]
    },
    test: {
      label: 'Test', tab: 'tests',
      list: () => window.ENDPOINTS.LIST_TESTS,
      record: () => window.ENDPOINTS.TESTS,
      relations: [
        { key: 'metricImplemented', title: 'Implements metric', type: 'metric' }
      ]
    }
  };

  // Shown first, in this order; any other non-empty fields follow
  const FIELD_ORDER = [
    'abbreviation', 'version', 'versionNotes', 'type', 'theme', 'keyword',
    'isApplicableFor', 'supportedBy', 'evaluator', 'functionEvaluator',
    'endpointURL', 'endpointDescription', 'repository', 'landingPage',
    'creator', 'license', 'inDimension', 'scoringFunction', 'createdBy'
  ];
  const SKIP = new Set(['identifier', 'title', 'description', 'status']);

  async function fetchList(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return Array.isArray(data) ? data : (data.items || data.results || []);
  }

  // Relations may hold bare ids or full URLs (…/tests/<id>)
  const extractId = (v) => {
    const s = String(v ?? '');
    const m = s.match(/\/([^\/?#]+)(?:[?#].*)?$/);
    return m ? m[1] : s;
  };

  const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);

  const humanize = (key) => key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/URL$/, ' URL')
    .replace(/^./, c => c.toUpperCase());

  function renderValue(key, v) {
    const { escapeHtml } = window.Components;
    if (Array.isArray(v)) return `<div class="chips">${v.map(x => renderScalar(x, true)).join('')}</div>`;
    if (key === 'keyword' && typeof v === 'string') {
      const words = v.split(',').map(w => w.trim()).filter(Boolean);
      return `<div class="chips">${words.map(w => `<span class="chip">${escapeHtml(w)}</span>`).join('')}</div>`;
    }
    if (typeof v === 'object') return `<pre><code>${escapeHtml(JSON.stringify(v, null, 2))}</code></pre>`;
    return renderScalar(v, false);
  }

  function renderScalar(v, asChip) {
    const { escapeHtml } = window.Components;
    const s = String(v);
    const cls = asChip ? ' class="chip"' : '';
    if (/^https?:\/\//i.test(s)) {
      return `<a${cls} href="${escapeHtml(s)}" target="_blank" rel="noopener">${escapeHtml(s)}</a>`;
    }
    return asChip ? `<span class="chip">${escapeHtml(s)}</span>` : escapeHtml(s);
  }

  function renderRelation(rel, item, titlesByType) {
    const { escapeHtml } = window.Components;
    const raw = item[rel.key];
    const ids = (Array.isArray(raw) ? raw : [raw]).filter(x => !isEmpty(x)).map(extractId);
    if (!ids.length) return '';
    const titles = titlesByType[rel.type] || {};
    const chips = ids.map(id =>
      `<a class="chip" href="${escapeHtml(Utils.entityUrl(rel.type, id))}">${escapeHtml(titles[id] || id)}</a>`
    ).join('');
    return `<tr><th class="eval-detail-key">${escapeHtml(rel.title)}</th><td class="eval-detail-val"><div class="chips">${chips}</div></td></tr>`;
  }

  async function loadEntityDetail() {
    const container = document.getElementById('entity-detail');
    const statusEl  = document.getElementById('entity-detail-status');
    const titleEl   = document.getElementById('entity-title');
    if (!container) return;
    const { escapeHtml, badge } = window.Components;

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id   = params.get('id');
    const cfg  = TYPES[type];
    const backLink = `${window.SITE_BASE}/status/${cfg ? '#' + cfg.tab : ''}`;

    if (!cfg || !id) {
      statusEl.innerHTML = `<span class="err">Missing or invalid <code>type</code> / <code>id</code> in the URL.</span>
        <a href="${escapeHtml(backLink)}">Back to the list of entities</a>.`;
      return;
    }

    try {
      statusEl.textContent = `Loading ${cfg.label.toLowerCase()}…`;

      // Fetch this type's list plus every list it links to, so related items show titles
      const neededTypes = [...new Set([type, ...cfg.relations.map(r => r.type)])];
      const lists = await Promise.all(neededTypes.map(t => fetchList(TYPES[t].list())));
      const titlesByType = {};
      const listByType = {};
      neededTypes.forEach((t, i) => {
        listByType[t] = lists[i];
        titlesByType[t] = Object.fromEntries(lists[i].map(x => [x.identifier, x.title || x.identifier]));
      });

      const item = listByType[type].find(x => String(x.identifier) === id);
      if (!item) throw new Error(`${cfg.label} "${id}" not found.`);

      titleEl.textContent = item.title || `${cfg.label} ${id}`;
      document.title = `${item.title || cfg.label} - ${document.title.split(' - ').pop()}`;

      const relationKeys = new Set(cfg.relations.map(r => r.key));
      const fieldKeys = [
        ...FIELD_ORDER.filter(k => k in item),
        ...Object.keys(item).filter(k => !FIELD_ORDER.includes(k))
      ].filter(k => !SKIP.has(k) && !relationKeys.has(k) && !isEmpty(item[k]));

      const statusBadge = item.status
        ? badge(item.status, String(item.status).toUpperCase() === 'ACTIVE' ? 'ok' : 'warn')
        : '';

      container.innerHTML = `
        <p class="entity-meta">
          <a href="${escapeHtml(backLink)}">← All ${cfg.tab}</a>
          ${badge(cfg.label)} ${statusBadge}
          <code>${escapeHtml(item.identifier)}</code>
        </p>
        ${item.description ? `<p class="entity-description">${escapeHtml(item.description)}</p>` : ''}

        <h2>Details</h2>
        <table class="eval-detail-table entity-detail-table"><tbody>
          ${fieldKeys.map(k => `<tr><th class="eval-detail-key">${escapeHtml(humanize(k))}</th><td class="eval-detail-val">${renderValue(k, item[k])}</td></tr>`).join('')}
        </tbody></table>

        ${cfg.relations.some(r => !isEmpty(item[r.key])) ? `
          <h2>Related</h2>
          <table class="eval-detail-table entity-detail-table"><tbody>
            ${cfg.relations.map(r => renderRelation(r, item, titlesByType)).join('')}
          </tbody></table>` : ''}

        <p><a class="md-button" href="${escapeHtml(`${cfg.record()}/${encodeURIComponent(id)}`)}" target="_blank" rel="noopener">View JSON-LD record</a></p>

        <details class="eval-json-details">
          <summary>Raw JSON</summary>
          <pre><code class="language-json">${escapeHtml(JSON.stringify(item, null, 2))}</code></pre>
        </details>
      `;
      statusEl.textContent = '';
    } catch (err) {
      statusEl.innerHTML = `<span class="err">Error: ${escapeHtml(err.message)}</span>
        <a href="${escapeHtml(backLink)}">Back to the list of entities</a>.`;
    }
  }

  window.EntityDetail = { loadEntityDetail };
})();
