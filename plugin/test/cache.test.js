const test = require('node:test');
const assert = require('node:assert');
const { freshCache, sleep } = require('./helpers.js');

test('makeKey: same (url, prompt) → same hex', () => {
  const { cache, cleanup } = freshCache();
  try {
    const a = cache.makeKey('https://example.com', 'extract title');
    const b = cache.makeKey('https://example.com', 'extract title');
    assert.strictEqual(a, b);
    assert.match(a, /^[0-9a-f]{64}$/);
  } finally { cleanup(); }
});

test('makeKey: trims whitespace and tolerates empty/undefined prompts', () => {
  const { cache, cleanup } = freshCache();
  try {
    const trimmed = cache.makeKey('  https://example.com  ', '  prompt  ');
    const tight = cache.makeKey('https://example.com', 'prompt');
    assert.strictEqual(trimmed, tight, 'whitespace must be trimmed before hashing');

    const undefinedPrompt = cache.makeKey('https://example.com', undefined);
    assert.match(undefinedPrompt, /^[0-9a-f]{64}$/);
  } finally { cleanup(); }
});

test('set + get: round-trip returns exact output, miss returns null', () => {
  const { cache, cleanup } = freshCache();
  try {
    assert.strictEqual(cache.get('https://example.com', 'p'), null, 'miss before set');

    cache.set('https://example.com', 'p', 'Example Domain');
    assert.strictEqual(cache.get('https://example.com', 'p'), 'Example Domain');

    assert.strictEqual(cache.get('https://example.com', 'other'), null);
    assert.strictEqual(cache.get('https://other.com', 'p'), null);
  } finally { cleanup(); }
});

test('get: increments hit_count on each successful read', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://example.com', 'p', 'output');
    assert.strictEqual(cache.list()[0].hit_count, 0, 'fresh row starts at 0');

    cache.get('https://example.com', 'p');
    assert.strictEqual(cache.list()[0].hit_count, 1, 'first hit → 1');

    cache.get('https://example.com', 'p');
    cache.get('https://example.com', 'p');
    assert.strictEqual(cache.list()[0].hit_count, 3, 'three hits → 3');

    const row = cache.list()[0];
    assert.ok(row.last_hit_at != null && row.last_hit_at >= row.cached_at,
      'last_hit_at populated and >= cached_at');
  } finally { cleanup(); }
});

test('TTL expiry: rows past TTL return null and are deleted', async () => {
  const { cache, cleanup } = freshCache({ ttlDays: 0.000001 });
  try {
    cache.set('https://example.com', 'p', 'output');
    assert.strictEqual(cache.get('https://example.com', 'p'), 'output', 'fresh hit before TTL');

    await sleep(200);

    assert.strictEqual(cache.get('https://example.com', 'p'), null, 'stale read returns null');
    assert.strictEqual(cache.list().length, 0, 'stale row deleted by get()');
  } finally { cleanup(); }
});

test('set: upsert replaces output on duplicate key, row count stays 1', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://example.com', 'p', 'first');
    cache.set('https://example.com', 'p', 'second');

    const rows = cache.list();
    assert.strictEqual(rows.length, 1, 'upsert: still one row');
    assert.strictEqual(cache.get('https://example.com', 'p'), 'second', 'output reflects latest write');
  } finally { cleanup(); }
});

test('purgeExpired: no-op when TTL is unlimited (Infinity)', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://a.com', 'p', 'x');
    cache.set('https://b.com', 'p', 'y');

    const purged = cache.purgeExpired();
    assert.strictEqual(purged, 0, 'unlimited TTL → purgeExpired removes nothing');
    assert.strictEqual(cache.list().length, 2, 'both rows still present');
  } finally { cleanup(); }
});

test('stats: returns rich shape with totals, hit_rate, top_urls, db_size', () => {
  const { cache, cleanup } = freshCache();
  try {
    let s = cache.stats();
    assert.strictEqual(s.total, 0);
    assert.strictEqual(s.hits, 0);
    assert.strictEqual(s.misses, 0);
    assert.strictEqual(s.hit_rate, 0);
    assert.strictEqual(s.last, null);
    assert.strictEqual(s.evicted, 0);
    assert.deepStrictEqual(s.top_urls, []);
    assert.ok(typeof s.db_size_bytes === 'number');

    cache.set('https://a.com', 'p', 'x');
    cache.set('https://b.com', 'p', 'y');
    cache.get('https://a.com', 'p');
    cache.get('https://a.com', 'p');
    cache.get('https://b.com', 'p');

    s = cache.stats();
    assert.strictEqual(s.total, 2);
    assert.strictEqual(s.hits, 3, 'sum of hit_count across rows');
    assert.strictEqual(s.misses, 0, 'no misses recorded yet');
    assert.strictEqual(s.hit_rate, 1, 'hits/(hits+misses) = 3/3 = 1');
    assert.ok(typeof s.last === 'number' && s.last > 0);
    assert.strictEqual(s.top_urls.length, 2);
    assert.strictEqual(s.top_urls[0].url, 'https://a.com', 'top by hit_count');
    assert.strictEqual(s.top_urls[0].hit_count, 2);
  } finally { cleanup(); }
});

test('stats: tracks miss_count for honest hit_rate', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://a.com', 'p', 'x');
    cache.get('https://a.com', 'p');             // hit
    cache.get('https://a.com', 'other');         // miss
    cache.get('https://nonexistent.com', 'p');   // miss
    cache.get('https://nonexistent.com', 'p');   // miss

    const s = cache.stats();
    assert.strictEqual(s.hits, 1);
    assert.strictEqual(s.misses, 3);
    assert.strictEqual(s.hit_rate, 0.25, '1/4');
  } finally { cleanup(); }
});

test('invalidate: deletes all entries for a url, returns count', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://a.com', 'p1', 'x');
    cache.set('https://a.com', 'p2', 'y');  // same url, different prompt
    cache.set('https://b.com', 'p1', 'z');
    assert.strictEqual(cache.list().length, 3);

    const removed = cache.invalidate('https://a.com');
    assert.strictEqual(removed, 2, 'both a.com entries gone');
    assert.strictEqual(cache.list().length, 1);
    assert.strictEqual(cache.list()[0].url, 'https://b.com');

    const noop = cache.invalidate('https://nonexistent.com');
    assert.strictEqual(noop, 0);
  } finally { cleanup(); }
});

test('clear: full wipe (no arg) removes everything', () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://a.com', 'p', 'x');
    cache.set('https://b.com', 'p', 'y');

    const removed = cache.clear();
    assert.strictEqual(removed, 2);
    assert.strictEqual(cache.list().length, 0);
  } finally { cleanup(); }
});

test('clear: older_than_days removes only stale entries', async () => {
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://old.com', 'p', 'x');
    await sleep(100);
    cache.set('https://new.com', 'p', 'y');

    // older_than_days that maps to ~50ms cutoff: 50/(86_400_000) days
    const cutoffDays = 50 / (24 * 60 * 60 * 1000);
    const removed = cache.clear(cutoffDays);
    assert.strictEqual(removed, 1, 'only old entry gone');
    assert.strictEqual(cache.list()[0].url, 'https://new.com');
  } finally { cleanup(); }
});

test('domain TTL: per-domain expiry overrides global TTL', async () => {
  const { cache, cleanup } = freshCache({
    ttlDays: 365,
    domainTtl: { 'short.com': 0.000001 }, // ~86ms
  });
  try {
    cache.set('https://short.com/page', 'p', 'expires fast');
    cache.set('https://long.com/page', 'p', 'long-lived');

    assert.strictEqual(cache.get('https://short.com/page', 'p'), 'expires fast');
    assert.strictEqual(cache.get('https://long.com/page', 'p'), 'long-lived');

    await sleep(200);

    assert.strictEqual(cache.get('https://short.com/page', 'p'), null, 'short.com expired');
    assert.strictEqual(cache.get('https://long.com/page', 'p'), 'long-lived', 'long.com still cached');
  } finally { cleanup(); }
});

test('domain TTL: suffix matching for subdomains', () => {
  const { cache, cleanup } = freshCache({
    domainTtl: { 'example.com': 7 },
  });
  try {
    const ttlExact = cache.getEffectiveTtl('https://example.com/page');
    const ttlSub = cache.getEffectiveTtl('https://api.example.com/page');
    const ttlOther = cache.getEffectiveTtl('https://other.com/page');

    assert.strictEqual(ttlExact, 7 * 24 * 60 * 60 * 1000);
    assert.strictEqual(ttlSub, 7 * 24 * 60 * 60 * 1000, 'subdomain matched via suffix');
    assert.strictEqual(ttlOther, Infinity, 'unknown domain falls back to global TTL');
  } finally { cleanup(); }
});

test('domain TTL: zero days means unlimited (Infinity)', () => {
  const { cache, cleanup } = freshCache({
    ttlDays: 1,
    domainTtl: { 'archive.org': 0 },
  });
  try {
    const ttlArchive = cache.getEffectiveTtl('https://archive.org/web/page');
    assert.strictEqual(ttlArchive, Infinity, '0 in domain TTL → unlimited');
  } finally { cleanup(); }
});

test('eviction: WEBCACHE_MAX_SIZE_MB triggers LRU drop on set()', () => {
  // Tiny limit forces eviction. evictIfNeeded() is called every 100 writes; we'll
  // call it directly to verify the eviction logic deterministically.
  const { cache, cleanup } = freshCache({ maxSizeMb: 0.001 }); // 1 KB cap
  try {
    // Seed enough rows that DB file > 1 KB.
    for (let i = 0; i < 50; i++) {
      cache.set(`https://example.com/${i}`, 'p', 'x'.repeat(200));
    }

    // Touch some rows so they have recent last_hit_at — they should survive eviction.
    for (let i = 45; i < 50; i++) {
      cache.get(`https://example.com/${i}`, 'p');
    }

    const before = cache.stats();
    const removed = cache.evictIfNeeded();
    const after = cache.stats();

    assert.ok(removed > 0, 'eviction actually deleted rows');
    assert.ok(after.total < before.total, 'row count decreased');
    assert.ok(after.evicted >= removed, 'evicted counter incremented');

    // Verify recently-hit rows survived.
    const survivingUrls = cache.list().map((r) => r.url);
    for (let i = 45; i < 50; i++) {
      assert.ok(
        survivingUrls.includes(`https://example.com/${i}`),
        `recently-hit row /${i} should survive LRU eviction`
      );
    }
  } finally { cleanup(); }
});

test('eviction: no-op when MAX_SIZE_MB unset', () => {
  const { cache, cleanup } = freshCache();
  try {
    for (let i = 0; i < 10; i++) cache.set(`https://example.com/${i}`, 'p', 'x');
    const removed = cache.evictIfNeeded();
    assert.strictEqual(removed, 0, 'unlimited size → no eviction');
    assert.strictEqual(cache.list().length, 10);
  } finally { cleanup(); }
});
