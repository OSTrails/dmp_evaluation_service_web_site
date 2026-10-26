// benchmarks.js

async function populateSelect(url, selectId, promptText = 'Select…') {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const resp = await fetch(url, { method: 'GET' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const list = Array.isArray(data) ? data : (data.items || data.results || []);
    select.innerHTML = '';

    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.disabled = true;
    prompt.selected = true;
    prompt.textContent = promptText;
    select.appendChild(prompt);

    list.forEach(item => {
      const id = item.benchmarkId ?? item.identifier ?? item.id ;
      const title = item.title ?? item.name ?? (id ? `Item ${id}` : 'Untitled');
      if (!id) return;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = title;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(`Failed to load options for #${selectId}`, err);
    select.innerHTML = `<option disabled selected>Failed to load</option>`;
  }
}

async function loadBenchmarks() {
  await populateSelect(window.ENDPOINTS.LIST_BENCHMARKS, 'benchmark-select', 'Select a benchmark…');
}

async function loadTests() {
  await populateSelect(window.ENDPOINTS.LIST_TESTS, 'test-select', 'Select a test…');
}

window.Benchmarks = { loadBenchmarks, loadTests };
