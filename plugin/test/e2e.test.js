'use strict';
// e2e tests for the qsearch-companion. Requires a running qsearch with the
// /url_content endpoint (v0.6.0+). Set QSEARCH_URL to point at it (default :8080).
// Tests that hit the network skip gracefully when qsearch is unreachable, so CI
// without a qsearch instance stays green.

const { test, before } = require('node:test');
const assert = require('node:assert');
const q = require('../scripts/qsearch-client.cjs');

let qsearchUp = false;
before(async () => {
  try {
    const r = await fetch(q.QSEARCH_URL + '/health', { signal: AbortSignal.timeout(2000) });
    qsearchUp = r.ok;
  } catch { qsearchUp = false; }
});

test('validateUrl: http/https only (no network)', () => {
  assert.equal(q.validateUrl('https://example.com').ok, true);
  assert.equal(q.validateUrl('http://example.com').ok, true);
  assert.equal(q.validateUrl('ftp://example.com').ok, false);
  assert.equal(q.validateUrl('').ok, false);
  assert.equal(q.validateUrl('not a url').ok, false);
});

test('urlContent returns full-page markdown (fetched or corpus)', async (t) => {
  if (!qsearchUp) return t.skip(`qsearch not reachable at ${q.QSEARCH_URL}`);
  const data = await q.urlContent('https://example.com');
  assert.ok(data, 'expected a result object');
  assert.ok(typeof data.markdown === 'string' && data.markdown.length > 0, 'non-empty markdown');
  assert.ok(['fetched', 'corpus'].includes(data.source), `unexpected source: ${data.source}`);
});

test('WebSearch store → lookup round-trip', async (t) => {
  if (!qsearchUp) return t.skip(`qsearch not reachable at ${q.QSEARCH_URL}`);
  const query = `webcache e2e ${process.pid} ${Date.now()}`;
  const stored = await q.searchStore(query, 'E2E-SEARCH-RESULT');
  assert.ok(stored, 'store should succeed');
  const hit = await q.searchLookup(query);
  assert.ok(hit && hit.includes('E2E-SEARCH-RESULT'), 'lookup should return stored text');
});

test('searchLookup miss returns null', async (t) => {
  if (!qsearchUp) return t.skip(`qsearch not reachable at ${q.QSEARCH_URL}`);
  const hit = await q.searchLookup(`definitely-not-cached-${Date.now()}-${process.hrtime.bigint()}`);
  assert.equal(hit, null);
});

test('stats reports backend status', async (t) => {
  if (!qsearchUp) return t.skip(`qsearch not reachable at ${q.QSEARCH_URL}`);
  const s = await q.stats();
  assert.equal(s.up, true);
});
