const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CACHE_DIR = path.join(os.homedir(), '.webcache');
const DB_PATH = path.join(CACHE_DIR, 'cache.db');

const _ttlRaw = process.env.WEBCACHE_TTL_DAYS;
const TTL_MS = (!_ttlRaw || _ttlRaw === '0')
  ? Infinity
  : Number(_ttlRaw) * 24 * 60 * 60 * 1000;

const _maxSizeRaw = process.env.WEBCACHE_MAX_SIZE_MB;
const MAX_SIZE_BYTES = (!_maxSizeRaw || _maxSizeRaw === '0')
  ? Infinity
  : Number(_maxSizeRaw) * 1024 * 1024;

const DOMAIN_TTL_MS = parseDomainTtl(process.env.WEBCACHE_DOMAIN_TTL);

const EVICT_CHECK_EVERY = 100;
let _writeCount = 0;
let db = null;

function parseDomainTtl(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    const out = {};
    for (const [domain, days] of Object.entries(parsed)) {
      const n = Number(days);
      out[String(domain).toLowerCase()] = (n === 0) ? Infinity : n * 24 * 60 * 60 * 1000;
    }
    return out;
  } catch {
    return {};
  }
}

function getEffectiveTtl(url) {
  if (!Object.keys(DOMAIN_TTL_MS).length) return TTL_MS;
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [domain, ttl] of Object.entries(DOMAIN_TTL_MS)) {
      if (host === domain || host.endsWith('.' + domain)) return ttl;
    }
  } catch { /* invalid url */ }
  return TTL_MS;
}

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
    CREATE INDEX IF NOT EXISTS idx_last_hit_at ON cache(last_hit_at);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
  `);
  db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('miss_count', 0)").run();
  db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('evict_count', 0)").run();
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
  if (!row) {
    d.prepare("UPDATE meta SET value = value + 1 WHERE key = 'miss_count'").run();
    return null;
  }
  const ttl = getEffectiveTtl(url);
  if (Date.now() - Number(row.cached_at) > ttl) {
    d.prepare('DELETE FROM cache WHERE key = ?').run(key);
    d.prepare("UPDATE meta SET value = value + 1 WHERE key = 'miss_count'").run();
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

  _writeCount++;
  if (_writeCount % EVICT_CHECK_EVERY === 0) {
    try { evictIfNeeded(); } catch { /* never crash on eviction */ }
  }
}

function invalidate(url) {
  const d = getDb();
  return d.prepare('DELETE FROM cache WHERE url = ?').run(url).changes;
}

function clear(olderThanDays) {
  const d = getDb();
  if (olderThanDays && olderThanDays > 0) {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    return d.prepare('DELETE FROM cache WHERE cached_at < ?').run(cutoff).changes;
  }
  return d.prepare('DELETE FROM cache').run().changes;
}

function evictIfNeeded() {
  if (MAX_SIZE_BYTES === Infinity) return 0;
  if (!fs.existsSync(DB_PATH)) return 0;
  const size = fs.statSync(DB_PATH).size;
  if (size <= MAX_SIZE_BYTES) return 0;
  const d = getDb();
  const total = Number(d.prepare('SELECT COUNT(*) AS n FROM cache').get().n);
  if (total === 0) return 0;
  // Drop ~20% of rows, oldest by last access. Floor at 1 (always make progress),
  // ceiling at total-1 (never wipe the whole cache via auto-eviction).
  const evictCount = Math.max(1, Math.min(total - 1, Math.ceil(total * 0.20)));
  const changes = d.prepare(`
    DELETE FROM cache WHERE key IN (
      SELECT key FROM cache
      ORDER BY COALESCE(last_hit_at, cached_at) ASC
      LIMIT ?
    )
  `).run(evictCount).changes;
  d.prepare("UPDATE meta SET value = value + ? WHERE key = 'evict_count'").run(changes);
  d.exec('VACUUM');
  return changes;
}

function stats() {
  const d = getDb();
  const total = Number(d.prepare('SELECT COUNT(*) AS n FROM cache').get().n);
  const hits = Number(d.prepare('SELECT COALESCE(SUM(hit_count), 0) AS n FROM cache').get().n);
  const lastRow = d.prepare('SELECT MAX(cached_at) AS t FROM cache').get();
  const last = lastRow.t == null ? null : Number(lastRow.t);
  const missesRow = d.prepare("SELECT value FROM meta WHERE key = 'miss_count'").get();
  const misses = missesRow ? Number(missesRow.value) : 0;
  const evictedRow = d.prepare("SELECT value FROM meta WHERE key = 'evict_count'").get();
  const evicted = evictedRow ? Number(evictedRow.value) : 0;
  const denom = hits + misses;
  const hit_rate = denom > 0 ? hits / denom : 0;
  const dbSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
  const topRows = d.prepare(`
    SELECT url, hit_count FROM cache
    WHERE hit_count > 0
    ORDER BY hit_count DESC
    LIMIT 5
  `).all().map((r) => ({ url: r.url, hit_count: Number(r.hit_count) }));
  return {
    total,
    hits,
    misses,
    hit_rate: Number(hit_rate.toFixed(4)),
    last,
    db_size_bytes: dbSize,
    evicted,
    top_urls: topRows,
  };
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
  if (TTL_MS === Infinity) return 0;
  const cutoff = Date.now() - TTL_MS;
  return d.prepare('DELETE FROM cache WHERE cached_at < ?').run(cutoff).changes;
}

module.exports = {
  get, set, stats, list,
  invalidate, clear,
  purgeExpired, evictIfNeeded,
  makeKey, getEffectiveTtl,
  DB_PATH, CACHE_DIR,
};
