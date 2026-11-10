// status.js
function setupHealthForm() {
  const healthForm = document.getElementById('form-health');
  if (!healthForm) return;

  const statusEl = document.getElementById('health-status');
  const resultEl = document.getElementById('health-result');

  healthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Checking…';
    resultEl.innerHTML = '';

    try {
      // Using benchmarks/list as a reachability probe
      const resp = await fetch(window.ENDPOINTS.LIST_BENCHMARKS, { method: 'GET' });
      await Utils.handleResponse(resp, statusEl, resultEl, renderHealth);
    } catch (err) {
      statusEl.innerHTML = `<span class="err">Error: ${err.message}</span>`;
    }
  });
}

function renderHealth(data) {
  const wrap = document.createElement('div');
  wrap.className = 'cards';
  const card = document.createElement('div');
  card.className = 'card';

  // If we ever switch to a real health endpoint that returns an object
  const isArray = Array.isArray(data);
  const count = isArray ? data.length : undefined;

  // Prefer true health fields if present
  const status = !isArray ? (data.status || 'reachable') : 'reachable';
  const version = !isArray ? data.version : undefined;
  const uptime  = !isArray ? data.uptime  : undefined;

  card.innerHTML = `
    <h3>Health</h3>
    <p><strong>Status:</strong> ${Utils.escapeHtml(status)}</p>
    ${version ? `<p><strong>Version:</strong> ${Utils.escapeHtml(version)}</p>` : ''}
    ${uptime  ? `<p><strong>Uptime:</strong> ${Utils.escapeHtml(uptime)}</p>` : ''}
    ${isArray ? `<p><strong>Benchmarks available:</strong> ${count}</p>` : ''}
  `;

  wrap.appendChild(card);
  return wrap;
}

window.Health = { setupHealthForm };
