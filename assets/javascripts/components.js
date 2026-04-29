// docs/assets/javascripts/components.js

(function () {
  function badge(text, variant='muted') {
    const v = variant==='ok' ? 'badge--ok' : variant==='warn' ? 'badge--warn' : 'badge--muted';
    return `<span class="badge ${v}">${escapeHtml(String(text))}</span>`;
  }

  function cardGrid(container, items, header, body) {
    container.innerHTML = '';
    container.classList.add('cards');
    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card clickable';
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="card-header">
          <div>${header(item)}</div>
          <div class="card-caret">▾</div>
        </div>
        <div class="card-body">${body(item)}</div>
      `;
      attachToggle(card);
      container.appendChild(card);
    });
  }

  function dataTable(container, rows, columns, opts={}) {
    const { searchable=true, paginated=true, pageSize=10 } = opts;
    container.innerHTML = '';

    const top = document.createElement('div');
    top.className = 'table-toolbar';
    if (searchable) top.innerHTML = `<input class="table-search" type="search" placeholder="Filter…">`;
    container.appendChild(top);

    const table = document.createElement('table');
    table.className = 'nice-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    let sortKey = null, sortDir = 1;
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.title;
      th.style.cursor = col.sortable ? 'pointer' : 'default';
      if (col.sortable) {
        th.addEventListener('click', () => {
          sortDir = (sortKey === col.key) ? -sortDir : 1;
          sortKey = col.key;
          render();
        });
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

    const pager = document.createElement('div');
    pager.className = 'table-pager';
    container.appendChild(pager);

    let q = '';
    let page = 1;

    const getFiltered = () => {
      let out = rows;
      if (q) {
        const needle = q.toLowerCase();
        out = rows.filter(r =>
          columns.some(c => String((c.value?.(r)) ?? r[c.key] ?? '')
            .toLowerCase().includes(needle))
        );
      }
      if (sortKey) {
        const col = columns.find(c => c.key === sortKey);
        out = [...out].sort((a,b) => {
          const va = (col.value ? col.value(a) : a[sortKey]) ?? '';
          const vb = (col.value ? col.value(b) : b[sortKey]) ?? '';
          return String(va).localeCompare(String(vb), undefined, { numeric:true }) * sortDir;
        });
      }
      return out;
    };

    function render() {
      const data = getFiltered();
      const total = data.length;

      let start = 0, end = total;
      if (paginated) {
        const maxPage = Math.max(1, Math.ceil(total / pageSize));
        page = Math.min(page, maxPage);
        start = (page-1)*pageSize;
        end = start + pageSize;
      }

      tbody.innerHTML = '';
      data.slice(start, end).forEach(r => {
        const tr = document.createElement('tr');
        columns.forEach(c => {
          const td = document.createElement('td');
          const val = c.value ? c.value(r) : r[c.key];
          td.innerHTML = val == null ? '' : val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      if (!paginated) { pager.innerHTML = ''; return; }
      const maxPage = Math.max(1, Math.ceil(total / pageSize));
      pager.innerHTML = `
        <button class="md-button" ${page<=1?'disabled':''} data-act="prev">Prev</button>
        <span>Page ${page} / ${maxPage} — ${total} item(s)</span>
        <button class="md-button" ${page>=maxPage?'disabled':''} data-act="next">Next</button>
      `;
      pager.querySelector('[data-act="prev"]')?.addEventListener('click', ()=>{ if(page>1){page--; render();} });
      pager.querySelector('[data-act="next"]')?.addEventListener('click', ()=>{ page++; render(); });
    }

    top.querySelector('.table-search')?.addEventListener('input', (e)=>{
      q = e.target.value || '';
      page = 1;
      render();
    });

    render();
  }

  function attachToggle(card) {
    const toggle = () => card.classList.toggle('open');
    card.addEventListener('click', e => { if (!e.target.closest('a,button,summary')) toggle(); });
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); toggle(); }});
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'","&#039;");
  }

  // expose globally
  window.Components = { badge, cardGrid, dataTable, escapeHtml };
})();
