// evaluate.js

function setupBenchmarkForm() {
  const form = document.getElementById('form-evaluate-benchmark');
  if (!form) return;

  const statusEl = document.getElementById('evaluate-benchmark-status');
  const resultEl = document.getElementById('evaluate-benchmark-result');

  form.addEventListener('reset', () => {
    statusEl.innerHTML = '';
    resultEl.innerHTML = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Submitting…';
    resultEl.innerHTML = '';

    try {
      const fd = new FormData(form);

      const benchmark = fd.get('benchmark');
      const file = fd.get('maDMP');

      if (!benchmark) throw new Error('Please select a benchmark.');
      if (!file || !file.name) throw new Error('Please choose a maDMP file.');

      const resp = await fetch(window.ENDPOINTS.ASSESS_BENCHMARK, {
        method: 'POST',
        body: fd
      });

      await Utils.handleResponse(resp, statusEl, resultEl, renderEvaluateArray);
    } catch (err) {
      statusEl.innerHTML = `<span class="err">Error: ${err.message}</span>`;
    }
  });
}

function setupTestForm() {
  const form = document.getElementById('form-evaluate-test');
  if (!form) return;

  const statusEl = document.getElementById('evaluate-test-status');
  const resultEl = document.getElementById('evaluate-test-result');

  form.addEventListener('reset', () => {
    statusEl.innerHTML = '';
    resultEl.innerHTML = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Submitting…';
    resultEl.innerHTML = '';

    try {
      const fd = new FormData(form);

      const test = fd.get('test');
      const file = fd.get('maDMP');

      if (!test) throw new Error('Please select a test.');
      if (!file || !file.name) throw new Error('Please choose a maDMP file.');

      const resp = await fetch(window.ENDPOINTS.ASSESS_TEST, {
        method: 'POST',
        body: fd
      });

      await Utils.handleResponse(resp, statusEl, resultEl, renderEvaluateArray);
    } catch (err) {
      statusEl.innerHTML = `<span class="err">Error: ${err.message}</span>`;
    }
  });
}

function _evalValueClass(val) {
  if (!val) return 'neutral';
  const v = val.toUpperCase();
  if (v === 'PASS') return 'pass';
  if (v === 'FAIL') return 'fail';
  return 'neutral';
}

function _evalFormatValue(key, val) {
  if (val === null || val === undefined || val === '') return '<em class="eval-empty">—</em>';
  if (Array.isArray(val)) {
    if (val.length === 0) return '<em class="eval-empty">—</em>';
    return val.map(v => `<span class="chip">${Utils.escapeHtml(String(v))}</span>`).join(' ');
  }
  const str = String(val);
  const lk = key.toLowerCase();
  if (lk.includes('time') || lk.includes('date')) {
    try { return Utils.escapeHtml(new Date(str).toLocaleString()); } catch (_) { /* fall through */ }
  }
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return `<a href="${Utils.escapeHtml(str)}" target="_blank" rel="noopener">${Utils.escapeHtml(str)}</a>`;
  }
  return Utils.escapeHtml(str);
}

function _evalFieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
}

function renderEvaluateArray(data) {
  const wrap = document.createElement('div');
  wrap.className = 'eval-cards';

  const arr = Array.isArray(data) ? data : (data?.results || [data]);
  if (!Array.isArray(arr) || arr.length === 0 || data === null) {
    wrap.innerHTML = `<div class="eval-card"><p class="eval-empty">No evaluations returned.</p></div>`;
    return wrap;
  }

  arr.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'eval-card';

    const val = ev.value ? String(ev.value) : null;
    const valHtml = val
      ? `<span class="eval-grade eval-grade--${_evalValueClass(val)}">${Utils.escapeHtml(val)}</span>`
      : '';

    const title = ev.title ? Utils.escapeHtml(String(ev.title)) : 'Evaluation';
    const descHtml = ev.description
      ? `<p class="eval-summary">${Utils.escapeHtml(String(ev.description))}</p>`
      : '';

    const SKIP = new Set(['title', 'value', 'description']);
    const rows = Object.entries(ev)
      .filter(([k]) => !SKIP.has(k))
      .map(([k, v]) => `
        <tr>
          <th class="eval-detail-key">${_evalFieldLabel(k)}</th>
          <td class="eval-detail-val">${_evalFormatValue(k, v)}</td>
        </tr>`).join('');

    card.innerHTML = `
      <div class="eval-card-header">
        <h3 class="eval-title">${title}</h3>
        ${valHtml}
      </div>
      ${descHtml}
      ${rows ? `<details class="eval-details"><summary>Details</summary><table class="eval-detail-table"><tbody>${rows}</tbody></table></details>` : ''}`;

    wrap.appendChild(card);
  });

  return wrap;
}

window.Evaluate = { setupBenchmarkForm, setupTestForm };
