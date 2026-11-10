# Evaluate

Pick what you want to evaluate.


## Evaluate a benchmark

=== "Benchmark"
Select a benchmark and upload your **maDMP**.  
This posts **multipart/form-data** to: <code class="api-url" data-path="/assess/benchmark">/assess/benchmark</code>.

<form id="form-evaluate-benchmark">
  <label>
    Benchmark
    <select id="benchmark-select" name="benchmark" required style="width:100%;">
      <option value="" disabled selected>Loading benchmarks…</option>
    </select>
  </label>

  <div style="margin: 0.75rem 0;"></div>

  <label>
    maDMP file (required)
    <input name="maDMP" type="file" accept=".json,.txt,.md,.pdf,.doc,.docx" required>
  </label>

  <div style="margin: 0.75rem 0;"></div>

  <div style="display:flex; gap:.5rem; margin-top:1rem;">
    <button class="md-button md-button--primary" type="submit">Evaluate benchmark</button>
    <button class="md-button" type="reset">Reset</button>
  </div>
</form>

<div id="evaluate-benchmark-status" style="margin-top:1rem;"></div>
<div id="evaluate-benchmark-result" style="margin-top:1rem;"></div>



## Evaluate a test
=== "Test"
Select a **test** and upload your **maDMP**.  
This will post to: <code class="api-url" data-path="/assess/test">/assess/test</code>.

<form id="form-evaluate-test">
  <label>
    Test
    <select id="test-select" name="test" required style="width:100%;">
      <option value="" disabled selected>Loading tests…</option>
    </select>
  </label>

  <div style="margin: 0.75rem 0;"></div>

  <label>
    maDMP file (required)
    <input name="maDMP" type="file" accept=".json,.txt,.md,.pdf,.doc,.docx" required>
  </label>

  <div style="margin: 0.75rem 0;"></div>

  <div style="display:flex; gap:.5rem; margin-top:1rem;">
    <button class="md-button md-button--primary" type="submit">Evaluate test</button>
    <button class="md-button" type="reset">Reset</button>
  </div>
</form>

<div id="evaluate-test-status" style="margin-top:1rem;"></div>
<div id="evaluate-test-result" style="margin-top:1rem;"></div>
