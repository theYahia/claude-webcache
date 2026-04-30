#!/usr/bin/env node
process.removeAllListeners('warning');
const cache = require('../src/cache.js');

function fmtAgo(ts) {
  if (!ts) return 'never';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

try {
  const s = cache.stats();
  if (s.total === 0) {
    process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }));
    process.exit(0);
  }
  const msg = `webcache: ${s.total} pages cached, ${s.hits} hits, last fetch ${fmtAgo(s.last)}`;
  process.stdout.write(JSON.stringify({
    continue: true,
    suppressOutput: true,
    systemMessage: msg,
  }));
} catch (err) {
  process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }));
}
