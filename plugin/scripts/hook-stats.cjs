#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// SessionStart hook: one-line status of the webcache→qsearch backend.
// Fail-open: if qsearch is unreachable, stay silent (don't nag every session start).

const q = require('./qsearch-client.cjs');

(async () => {
  try {
    const s = await q.stats();
    if (!s.up) {
      // qsearch offline → webcache hooks fail-open to native WebFetch. Silent.
      process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }
    const parts = [];
    if (s.corpus_total != null) parts.push(`${s.corpus_total} pages in corpus`);
    if (s.search_hit_rate != null) parts.push(`${Math.round(s.search_hit_rate * 100)}% search hit rate`);
    const msg = `webcache → qsearch (${q.QSEARCH_URL})${parts.length ? ': ' + parts.join(', ') : ' connected'}`;
    process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true, systemMessage: msg }));
  } catch {
    process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }));
  }
})();
