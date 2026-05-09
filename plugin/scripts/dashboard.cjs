'use strict';
const http = require('node:http');
const cache = require('../src/cache.js');
const PLUGIN_MANIFEST = require('../.claude-plugin/plugin.json');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fmtAge(ts) {
  if (!ts) return '—';
  const d = Date.now() - ts;
  if (d < 60_000) return `${Math.round(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.round(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h ago`;
  return `${Math.round(d / 86_400_000)}d ago`;
}

function domainOf(url) {
  try { return new URL(url).hostname; } catch { return '—'; }
}

function buildHtml(query) {
  const s = cache.stats();
  const all = cache.list(1000);
  const filtered = query
    ? all.filter((r) => r.url.toLowerCase().includes(query.toLowerCase()))
    : all;
  const recent = filtered.slice(0, 100);

  const domainAgg = {};
  for (const r of all) {
    const d = domainOf(r.url);
    if (!domainAgg[d]) domainAgg[d] = { count: 0, hits: 0 };
    domainAgg[d].count++;
    domainAgg[d].hits += r.hit_count;
  }
  const topDomains = Object.entries(domainAgg)
    .sort((a, b) => b[1].hits - a[1].hits || b[1].count - a[1].count)
    .slice(0, 10);

  const rowHtml = (r) => `
    <tr>
      <td><span class="dom">${escapeHtml(domainOf(r.url))}</span></td>
      <td><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.url.length > 80 ? r.url.slice(0, 80) + '…' : r.url)}</a></td>
      <td class="num">${r.hit_count}</td>
      <td class="num">${fmtAge(r.cached_at)}</td>
      <td class="num">${fmtAge(r.last_hit_at)}</td>
      <td><button class="invalidate" data-url="${escapeHtml(r.url)}">×</button></td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>claude-webcache dashboard</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 -apple-system, system-ui, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
  h1 { margin: 0 0 .5rem; font-size: 1.4rem; }
  .sub { color: #888; margin-bottom: 1.5rem; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: .75rem; margin-bottom: 1.5rem; }
  .stat { padding: .75rem 1rem; background: rgba(127,127,127,.1); border-radius: 6px; }
  .stat .v { font-size: 1.4rem; font-weight: 600; }
  .stat .l { font-size: .75rem; color: #888; text-transform: uppercase; letter-spacing: .04em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid rgba(127,127,127,.2); }
  th { font-weight: 600; color: #888; font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
  td.num { text-align: right; white-space: nowrap; color: #888; font-variant-numeric: tabular-nums; }
  .dom { display: inline-block; padding: 1px 6px; background: rgba(127,127,127,.15); border-radius: 3px; font-size: 11px; }
  a { color: inherit; }
  input[type=search] { width: 100%; padding: .5rem .75rem; font: inherit; border: 1px solid rgba(127,127,127,.3); border-radius: 4px; background: transparent; color: inherit; margin-bottom: 1rem; }
  button.invalidate { background: transparent; border: 1px solid rgba(127,127,127,.3); border-radius: 3px; cursor: pointer; padding: 0 6px; font-size: 14px; line-height: 1.4; color: inherit; }
  button.invalidate:hover { background: rgba(220,50,50,.15); border-color: rgba(220,50,50,.5); }
  .empty { color: #888; padding: 1rem; text-align: center; }
</style>
</head>
<body>
  <h1>claude-webcache <span class="sub">v${escapeHtml(PLUGIN_MANIFEST.version)}</span></h1>
  <div class="sub">DB: <code>${escapeHtml(cache.DB_PATH)}</code></div>

  <div class="stats">
    <div class="stat"><div class="v">${s.total}</div><div class="l">entries</div></div>
    <div class="stat"><div class="v">${s.hits}</div><div class="l">hits</div></div>
    <div class="stat"><div class="v">${s.misses}</div><div class="l">misses</div></div>
    <div class="stat"><div class="v">${(s.hit_rate * 100).toFixed(1)}%</div><div class="l">hit rate</div></div>
    <div class="stat"><div class="v">${fmtBytes(s.db_size_bytes)}</div><div class="l">db size</div></div>
    <div class="stat"><div class="v">${s.evicted}</div><div class="l">evicted</div></div>
    <div class="stat"><div class="v">${fmtAge(s.last)}</div><div class="l">last write</div></div>
  </div>

  <div class="grid">
    <div>
      <h2 style="font-size:1rem;margin:0 0 .5rem">Top URLs by hits</h2>
      <table>
        <thead><tr><th>URL</th><th>hits</th></tr></thead>
        <tbody>
          ${s.top_urls.length === 0
    ? '<tr><td colspan="2" class="empty">No hits yet</td></tr>'
    : s.top_urls.map((r) => `<tr><td>${escapeHtml(r.url)}</td><td class="num">${r.hit_count}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div>
      <h2 style="font-size:1rem;margin:0 0 .5rem">Top domains</h2>
      <table>
        <thead><tr><th>Domain</th><th>entries</th><th>hits</th></tr></thead>
        <tbody>
          ${topDomains.length === 0
    ? '<tr><td colspan="3" class="empty">Empty</td></tr>'
    : topDomains.map(([d, v]) => `<tr><td>${escapeHtml(d)}</td><td class="num">${v.count}</td><td class="num">${v.hits}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <h2 style="font-size:1rem;margin:1.5rem 0 .5rem">Recent (${recent.length}${query ? ` of ${all.length}, filtered` : ''})</h2>
  <form method="get" action="/">
    <input type="search" name="q" value="${escapeHtml(query || '')}" placeholder="Filter by URL substring…" autofocus>
  </form>
  <table>
    <thead>
      <tr><th>Domain</th><th>URL</th><th>hits</th><th>cached</th><th>last hit</th><th></th></tr>
    </thead>
    <tbody>
      ${recent.length === 0
    ? '<tr><td colspan="6" class="empty">No entries match</td></tr>'
    : recent.map(rowHtml).join('')}
    </tbody>
  </table>

<script>
document.querySelectorAll('button.invalidate').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const url = btn.dataset.url;
    if (!confirm('Invalidate all entries for:\\n' + url + '?')) return;
    const r = await fetch('/api/invalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (r.ok) location.reload();
    else alert('Failed: ' + await r.text());
  });
});
</script>
</body>
</html>`;
}

function start(port) {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, `http://localhost:${port}`);

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        const q = url.searchParams.get('q') || '';
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildHtml(q));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cache.stats()));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/invalidate') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try {
            const { url: target } = JSON.parse(body || '{}');
            if (!target) {
              res.writeHead(400); res.end('url required'); return;
            }
            const deleted = cache.invalidate(target);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ deleted }));
          } catch (e) {
            res.writeHead(500); res.end(e.message);
          }
        });
        return;
      }

      res.writeHead(404); res.end('not found');
    } catch (e) {
      res.writeHead(500); res.end(e.message);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    process.stdout.write(`claude-webcache dashboard → http://localhost:${port}/\n`);
    process.stdout.write('Ctrl-C to stop.\n');
  });

  server.on('error', (err) => {
    process.stderr.write(`Failed to start dashboard: ${err.message}\n`);
    process.exit(1);
  });

  return server;
}

module.exports = { start };
