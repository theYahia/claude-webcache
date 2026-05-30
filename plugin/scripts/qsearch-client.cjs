'use strict';
// Thin HTTP client to a running qsearch instance — the backend for all webcache hooks.
// webcache is now a qsearch companion: the hooks intercept native WebFetch/WebSearch
// and proxy to qsearch (full-page url cache via /url_content, query cache via
// /cache_lookup + /cache_store). No local SQLite. FAIL-OPEN: any error / qsearch down
// → return null/false so the native tool runs unimpeded.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CACHE_DIR = path.join(os.homedir(), '.webcache');
const HOOK_LOG_PATH = path.join(CACHE_DIR, 'hook.log');
const QSEARCH_URL = (process.env.QSEARCH_URL || 'http://localhost:8080').replace(/\/+$/, '');
const TIMEOUT_MS = Number(process.env.WEBCACHE_QSEARCH_TIMEOUT_MS) || 8000;
// Stable tag so /cache_store and /cache_lookup hash the same key for native WebSearch.
const SEARCH_ENGINES = ['websearch'];

function ensureDir() { try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch {} }

function logError(label, err) {
  const msg = err && err.message ? err.message : String(err);
  const line = `[${new Date().toISOString()}] [claude-webcache] ${label}: ${msg}\n`;
  if (process.env.WEBCACHE_QUIET !== '1') { try { process.stderr.write(line); } catch {} }
  try { ensureDir(); fs.appendFileSync(HOOK_LOG_PATH, line); } catch {}
}

// Carried over from the retired cache.js — cheap http/https scheme gate.
function validateUrl(raw) {
  const s = (raw || '').trim();
  if (!s) return { ok: false, reason: 'empty url' };
  let u;
  try { u = new URL(s); } catch { return { ok: false, reason: 'malformed url' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, reason: `unsupported scheme: ${u.protocol}` };
  }
  return { ok: true };
}

async function _fetch(pathname, { method = 'GET', body } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(QSEARCH_URL + pathname, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } finally { clearTimeout(t); }
}

// POST /url_content → { url, title, markdown, source, crawled_at } | null (fail-open).
async function urlContent(url, opts = {}) {
  try {
    const res = await _fetch('/url_content', { method: 'POST', body: { url, max_age_days: opts.maxAgeDays } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.markdown) return null;
    return data;
  } catch (e) { logError('url_content', e); return null; }
}

// GET /cache_lookup?query=&engines= → cached results as text | null (fail-open).
async function searchLookup(query) {
  try {
    const qs = new URLSearchParams({ query, engines: SEARCH_ENGINES.join(',') });
    const res = await _fetch('/cache_lookup?' + qs.toString());
    if (!res.ok) return null; // 404 = miss
    const data = await res.json();
    if (!data || !data.hit || data.results == null) return null;
    const r = data.results;
    if (typeof r === 'string') return r;
    if (typeof r.text === 'string') return r.text;
    try { return JSON.stringify(r); } catch { return null; }
  } catch (e) { logError('cache_lookup', e); return null; }
}

// POST /cache_store { query, engines, results } → bool ok (fail-open).
async function searchStore(query, outputText) {
  try {
    const res = await _fetch('/cache_store', { method: 'POST', body: { query, engines: SEARCH_ENGINES, results: { text: outputText } } });
    return !!(res && res.ok);
  } catch (e) { logError('cache_store', e); return false; }
}

// Merge /corpus/stats + /cache_stats for the SessionStart status line.
// Returns { up, corpus_total, webfetch_total, search_hit_rate } | { up:false }.
async function stats() {
  try {
    const [cs, qs] = await Promise.all([
      _fetch('/corpus/stats').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      _fetch('/cache_stats').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (!cs && !qs) return { up: false };
    return {
      up: true,
      corpus_total: cs ? (cs.total_documents ?? cs.total ?? null) : null,
      webfetch_total: cs && cs.namespaces ? (cs.namespaces.webfetch ?? null) : null,
      search_hit_rate: qs ? (qs.cache_hit_rate ?? null) : null,
    };
  } catch (e) { logError('stats', e); return { up: false }; }
}

module.exports = {
  QSEARCH_URL, HOOK_LOG_PATH, CACHE_DIR,
  validateUrl, logError, urlContent, searchLookup, searchStore, stats,
};
