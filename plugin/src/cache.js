'use strict';
// Minimal local SQLite cache — the store that FEDERATION reads from and writes peer
// hits into. Pure Node stdlib (node:sqlite, node:crypto, node:fs, node:path, node:os).
//
// History: v0.6.0 retired the original full-featured SQLite cache.js in favor of the
// qsearch companion (qsearch-client.cjs is the live WebFetch/WebSearch backend). The
// federation MVP (v0.7.0) reintroduces a *minimal* local cache as the cross-instance
// sharing substrate: peers need a real local key-value store with a stable, shared key
// scheme so a value cached on instance A can be looked up by instance B. This module is
// intentionally narrow — only what federation needs (canonUrl, makeKey, get, set, stats,
// list) — not a revival of the v0.4.0 eviction/TTL/gzip machinery.
//
// Key scheme (unchanged from the v0.4.0 contract, so historical DBs stay compatible):
//   key = SHA256( namespace + '|' + canonUrl(url) + '|' + prompt )  -> 64-char hex
// Because both the URL canonicalizer and the hash are deterministic and self-contained,
// two independent instances derive the SAME key for the same (namespace, url, prompt) —
// which is what makes federation lookups match across machines.

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// node:sqlite is stdlib (Node >=22, stable from 22.5). Load lazily + fail-open so that
// importing this module on an older runtime never throws at require() time — callers get
// graceful nulls instead (every federation path is fail-open by design).
let DatabaseSync = null;
let SQLITE_LOAD_ERR = null;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
  SQLITE_LOAD_ERR = e;
}

const CACHE_DIR = path.join(os.homedir(), '.webcache');
const DEFAULT_DB_PATH = path.join(CACHE_DIR, 'cache.db');
const NAMESPACE = process.env.WEBCACHE_NAMESPACE || '';

// Credential-bearing query params stripped from the *stored/display* URL (not the key).
const CREDENTIAL_PARAMS = new Set([
  'token', 'api_key', 'apikey', 'access_token', 'auth', 'secret',
  'password', 'key', 'signature', 'sig', 'sessionid',
]);

function sqliteAvailable() {
  return DatabaseSync != null;
}

// --- URL canonicalization (deterministic; shared across instances) -------------------
// lowercase host, drop default ports, drop fragment, sort query params. Identical output
// on every instance => identical hash key => federation cross-instance hits line up.
function canonUrl(raw) {
  const s = (raw || '').trim();
  let u;
  try {
    u = new URL(s);
  } catch {
    return s; // non-URL input: hash the raw string verbatim (still deterministic)
  }
  u.hostname = u.hostname.toLowerCase();
  if (
    (u.protocol === 'http:' && u.port === '80') ||
    (u.protocol === 'https:' && u.port === '443')
  ) {
    u.port = '';
  }
  u.hash = '';
  u.searchParams.sort();
  let out = u.toString();
  // URL serialization keeps a trailing '?' when params were present then cleared; trim it.
  if (out.endsWith('?')) out = out.slice(0, -1);
  return out;
}

// Display/storage redaction — strip userinfo + credential-like params. Display-level only.
function redactUrl(raw) {
  const s = (raw || '').trim();
  let u;
  try {
    u = new URL(s);
  } catch {
    return s;
  }
  if (u.username || u.password) {
    u.username = '';
    u.password = '';
  }
  for (const k of [...u.searchParams.keys()]) {
    if (CREDENTIAL_PARAMS.has(k.toLowerCase())) u.searchParams.set(k, '***');
  }
  return u.toString();
}

function sha256hex(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

// THE shared key. namespace + canonical url + prompt. Matches the v0.4.0 contract.
function makeKey(url, prompt, namespace = NAMESPACE) {
  return sha256hex(`${namespace}|${canonUrl(url)}|${prompt || ''}`);
}

function validateUrl(raw) {
  const s = (raw || '').trim();
  if (!s) return { ok: false, reason: 'empty url' };
  let u;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, reason: 'malformed url' };
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, reason: `unsupported scheme: ${u.protocol}` };
  }
  return { ok: true };
}

// --- DB plumbing ---------------------------------------------------------------------
// One connection per (resolved) db path. Federation tests spin multiple DBs by passing
// distinct dbPath values, so we key the connection pool by path.
const _pool = new Map();

function ensureDirFor(p) {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  } catch {}
}

function getDb(dbPath = DEFAULT_DB_PATH) {
  if (!sqliteAvailable()) {
    const msg = SQLITE_LOAD_ERR ? SQLITE_LOAD_ERR.message : 'node:sqlite unavailable';
    throw new Error(`node:sqlite not available (requires Node >=22): ${msg}`);
  }
  const cached = _pool.get(dbPath);
  if (cached) return cached;

  ensureDirFor(dbPath);
  const db = new DatabaseSync(dbPath);
  // WAL + busy_timeout for safe concurrent multi-process access (federation-server
  // reads the same file the MCP server writes).
  db.exec('PRAGMA busy_timeout = 5000');
  try {
    db.exec('PRAGMA journal_mode = WAL');
  } catch {
    // fall back to default journal mode rather than failing the whole open
  }
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key         TEXT PRIMARY KEY,
      url         TEXT NOT NULL,
      prompt_hash TEXT NOT NULL,
      output      TEXT NOT NULL,
      cached_at   INTEGER NOT NULL,
      hit_count   INTEGER NOT NULL DEFAULT 0,
      last_hit_at INTEGER,
      namespace   TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_cached_at ON cache(cached_at);
    CREATE INDEX IF NOT EXISTS idx_namespace ON cache(namespace);
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
  `);
  _pool.set(dbPath, db);
  return db;
}

function bumpMeta(db, key, by = 1) {
  db.prepare(
    `INSERT INTO meta(key, value) VALUES(?, ?)
     ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
  ).run(key, by);
}

// --- public cache API (the surface federation builds on) -----------------------------

// get(url, prompt, opts?) -> output string | null. Increments hit counters on hit,
// miss_count on miss. opts.dbPath / opts.namespace allow multi-instance test setups.
function get(url, prompt, opts = {}) {
  const namespace = opts.namespace != null ? opts.namespace : NAMESPACE;
  const dbPath = opts.dbPath || DEFAULT_DB_PATH;
  let db;
  try {
    db = getDb(dbPath);
  } catch {
    return null; // fail-open: no sqlite -> behave like an empty cache
  }
  const key = makeKey(url, prompt, namespace);
  const row = db.prepare('SELECT output FROM cache WHERE key = ?').get(key);
  if (!row) {
    bumpMeta(db, 'miss_count', 1);
    return null;
  }
  db.prepare('UPDATE cache SET hit_count = hit_count + 1, last_hit_at = ? WHERE key = ?')
    .run(Date.now(), key);
  return row.output;
}

// set(url, prompt, output, opts?) -> { ok, key } | { ok:false, reason }. Upsert.
function set(url, prompt, output, opts = {}) {
  const namespace = opts.namespace != null ? opts.namespace : NAMESPACE;
  const dbPath = opts.dbPath || DEFAULT_DB_PATH;
  const v = validateUrl(url);
  if (!v.ok) return { ok: false, reason: v.reason };
  if (output == null) return { ok: false, reason: 'empty output' };
  let db;
  try {
    db = getDb(dbPath);
  } catch (e) {
    return { ok: false, reason: e.message };
  }
  const key = makeKey(url, prompt, namespace);
  db.prepare(
    `INSERT INTO cache(key, url, prompt_hash, output, cached_at, hit_count, last_hit_at, namespace)
     VALUES(?, ?, ?, ?, ?, 0, NULL, ?)
     ON CONFLICT(key) DO UPDATE SET
       output = excluded.output,
       url = excluded.url,
       cached_at = excluded.cached_at`
  ).run(
    key,
    redactUrl(url),
    sha256hex(prompt || '').slice(0, 16),
    String(output),
    Date.now(),
    namespace
  );
  return { ok: true, key };
}

function stats(opts = {}) {
  const dbPath = opts.dbPath || DEFAULT_DB_PATH;
  let db;
  try {
    db = getDb(dbPath);
  } catch {
    return { available: false, total: 0, hits: 0, misses: 0 };
  }
  const total = db.prepare('SELECT COUNT(*) AS n FROM cache').get().n;
  const hits = db.prepare('SELECT COALESCE(SUM(hit_count),0) AS n FROM cache').get().n;
  const missRow = db.prepare("SELECT value FROM meta WHERE key = 'miss_count'").get();
  const misses = missRow ? missRow.value : 0;
  return { available: true, total, hits, misses };
}

function list(limit = 50, opts = {}) {
  const dbPath = opts.dbPath || DEFAULT_DB_PATH;
  let db;
  try {
    db = getDb(dbPath);
  } catch {
    return [];
  }
  return db
    .prepare('SELECT key, url, cached_at, hit_count FROM cache ORDER BY cached_at DESC LIMIT ?')
    .all(Math.max(1, limit | 0));
}

// Test/teardown helper — close + drop a pooled connection.
function _closeDb(dbPath = DEFAULT_DB_PATH) {
  const db = _pool.get(dbPath);
  if (db) {
    try {
      db.close();
    } catch {}
    _pool.delete(dbPath);
  }
}

module.exports = {
  CACHE_DIR,
  DEFAULT_DB_PATH,
  NAMESPACE,
  sqliteAvailable,
  canonUrl,
  redactUrl,
  makeKey,
  validateUrl,
  getDb,
  get,
  set,
  stats,
  list,
  _closeDb,
};
