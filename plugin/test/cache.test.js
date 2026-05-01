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

    // Should not throw on undefined prompt — current code coerces via `|| ''`
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

    // Different prompt = different key = miss
    assert.strictEqual(cache.get('https://example.com', 'other'), null);
    // Different URL = different key = miss
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
  // 0.000001 days ≈ 86ms. Sleep 200ms to guarantee we're past TTL.
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
  // Default (no env) → TTL_MS = Infinity. cutoff = Date.now() - Infinity = -Infinity.
  // SQL `WHERE cached_at < -Infinity` matches nothing — by design. Test locks this behavior.
  const { cache, cleanup } = freshCache();
  try {
    cache.set('https://a.com', 'p', 'x');
    cache.set('https://b.com', 'p', 'y');

    const purged = cache.purgeExpired();
    assert.strictEqual(purged, 0, 'unlimited TTL → purgeExpired removes nothing');
    assert.strictEqual(cache.list().length, 2, 'both rows still present');
  } finally { cleanup(); }
});

test('stats: aggregates total, hits, last across rows', () => {
  const { cache, cleanup } = freshCache();
  try {
    let s = cache.stats();
    assert.deepStrictEqual(s, { total: 0, hits: 0, last: null }, 'empty cache stats');

    cache.set('https://a.com', 'p', 'x');
    cache.set('https://b.com', 'p', 'y');
    cache.get('https://a.com', 'p');
    cache.get('https://a.com', 'p');
    cache.get('https://b.com', 'p');

    s = cache.stats();
    assert.strictEqual(s.total, 2);
    assert.strictEqual(s.hits, 3, 'sum of hit_count across rows');
    assert.ok(typeof s.last === 'number' && s.last > 0, 'last is a numeric timestamp');
  } finally { cleanup(); }
});
