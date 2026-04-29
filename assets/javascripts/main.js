// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Evaluate page
  if (document.getElementById('benchmark-select'))       Benchmarks.loadBenchmarks();
  if (document.getElementById('test-select'))            Benchmarks.loadTests?.();
  if (document.getElementById('form-evaluate-benchmark')) Evaluate.setupBenchmarkForm();
  if (document.getElementById('form-evaluate-test'))     Evaluate.setupTestForm?.();

  // Status page — guard on the table elements that each loader actually needs
  if (document.getElementById('benchmarks-table')) StatusLists.loadBenchmarksList();
  if (document.getElementById('metrics-table'))    StatusLists.loadMetricsList();
  if (document.getElementById('tests-table'))      StatusLists.loadTestsList();
});
