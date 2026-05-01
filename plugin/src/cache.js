const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CACHE_DIR = path.join(os.homedir(), '.webcache');
const DB_PATH = path.join(CACHE_DIR, 'cache.db');
// WEBCACHE_TTL_DAYS=0 or unset → unlimited; positive number → days
const _ttlRaw = process.env.WEBCACHE_TTL_DAYS;
const TTL_MS = (!_ttlRaw || _ttlRaw === '0')
  ? Infinity
  : Number(_ttlRaw) * 24 * 60 * 60 * 1000;

let db = null;

function getDb() {
  if (db) return db;
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      prompt_hash TEXT NOT NULL,
      output TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      hit_count INTEGER NOT NULL DEFAULT 0,
      last_hit_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_cached_at ON cache(cached_at);
    CREATE INDEX IF NOT EXISTS idx_url ON cache(url);
  `);
  return db;
}

function makeKey(url, prompt) {
  const norm = (url || '').trim() + '|' + (prompt || '').trim();
  return crypto.createHash('sha256').update(norm).digest('hex');
}

function get(url, prompt) {
  const d = getDb();
  const key = makeKey(url, prompt);
  const row = d.prepare('SELECT output, cached_at FROM cache WHERE key = ?').get(key);
  if (!row) return null;
  if (Date.now() - Number(row.cached_at) > TTL_MS) {
    d.prepare('DELETE FROM cache WHERE key = ?').run(key);
    return null;
  }
  d.prepare('UPDATE cache SET hit_count = hit_count + 1, last_hit_at = ? WHERE key = ?')
    .run(Date.now(), key);
  return row.output;
}

function set(url, prompt, output) {
  const d = getDb();
  const key = makeKey(url, prompt);
  const promptHash = crypto.createHash('sha256').update(prompt || '').digest('hex').slice(0, 16);
  d.prepare(`
    INSERT INTO cache (key, url, prompt_hash, output, cached_at, hit_count)
    VALUES (?, ?, ?, ?, ?, 0)
    ON CONFLICT(key) DO UPDATE SET
      output = excluded.output,
      cached_at = excluded.cached_at
  `).run(key, url, promptHash, output, Date.now());
}

function stats() {
  const d = getDb();
  const total = Number(d.prepare('SELECT COUNT(*) AS n FROM cache').get().n);
  const hits = Number(d.prepare('SELECT COALESCE(SUM(hit_count), 0) AS n FROM cache').get().n);
  const lastRow = d.prepare('SELECT MAX(cached_at) AS t FROM cache').get();
  const last = lastRow.t == null ? null : Number(lastRow.t);
  return { total, hits, last };
}

function list(limit = 50) {
  const d = getDb();
  return d.prepare(`
    SELECT url, cached_at, hit_count, last_hit_at
    FROM cache
    ORDER BY cached_at DESC
    LIMIT ?
  `).all(limit).map((r) => ({
    url: r.url,
    cached_at: Number(r.cached_at),
    hit_count: Number(r.hit_count),
    last_hit_at: r.last_hit_at == null ? null : Number(r.last_hit_at),
  }));
}

function purgeExpired() {
  const d = getDb();
  const cutoff = Date.now() - TTL_MS;
  return d.prepare('DELETE FROM cache WHERE cached_at < ?').run(cutoff).changes;
}

module.exports = { get, set, stats, list, purgeExpired, makeKey, DB_PATH, CACHE_DIR };
