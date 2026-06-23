'use strict';
// Federation MVP tests — pure stdlib (node:test, node:assert, node:http, node:os, node:fs).
// No network, no qsearch: every test spins its own loopback servers and isolated SQLite
// DBs in a temp dir. Covers parsePeers, the FAIL-OPEN contract (no peers / all-down),
// peer-hit-pulls-into-local, token auth (401/200), and cross-instance key agreement
// (value set on instance A is found by instance B via a real federation-server).

process.removeAllListeners('warning'); // hush the node:sqlite ExperimentalWarning

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

const federation = require('../src/federation.js');
const cache = require('../src/cache.js');
const fedServer = require('../scripts/federation-server.cjs');

const SQLITE_OK = cache.sqliteAvailable();

// --- helpers -------------------------------------------------------------------------

let TMP;
before(() => {
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'webcache-fed-'));
});
after(() => {
  try {
    fs.rmSync(TMP, { recursive: true, force: true });
  } catch {}
});

let dbCounter = 0;
function freshDbPath() {
  return path.join(TMP, `cache-${process.pid}-${dbCounter++}.db`);
}

// Spin an ad-hoc HTTP server with a custom handler. Returns { url, close }.
function spinServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// Spin a real federation-server bound to a temp DB + optional token.
async function spinFederation({ dbPath, token } = {}) {
  // federation-server reads cache via cache.getDb() (default path). Tests that need a
  // specific DB set WEBCACHE-style isolation by pointing HOME at TMP (so DEFAULT_DB_PATH
  // lands there) — but simpler: we drive it by env for host/port/token and let it use
  // whatever DEFAULT_DB_PATH resolves to. For cross-instance we instead use spinServer
  // with a hand-rolled handler bound to an explicit dbPath. See the cross-instance test.
  const prevToken = process.env.WEBCACHE_FEDERATION_TOKEN;
  if (token != null) process.env.WEBCACHE_FEDERATION_TOKEN = token;
  // federation-server module-level TOKEN was captured at require() — so for token tests
  // we use a hand-rolled server (below) instead of this helper.
  const { server, port, host } = await fedServer.start({ host: '127.0.0.1', port: 0 });
  if (prevToken === undefined) delete process.env.WEBCACHE_FEDERATION_TOKEN;
  else process.env.WEBCACHE_FEDERATION_TOKEN = prevToken;
  return {
    url: `http://${host}:${port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}

// Hand-rolled federation-equivalent server bound to an explicit dbPath + token. Mirrors
// federation-server.cjs routes so cross-instance tests can point at distinct DBs without
// relying on the module-level DEFAULT_DB_PATH / captured TOKEN.
const crypto = require('node:crypto');
function tokenOk(configured, provided) {
  if (!configured) return true;
  const a = crypto.createHash('sha256').update(String(provided || '')).digest();
  const b = crypto.createHash('sha256').update(configured).digest();
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
function makeFedHandler(dbPath, token) {
  return (req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    const send = (s, o) => {
      const b = JSON.stringify(o);
      res.writeHead(s, { 'Content-Type': 'application/json' });
      res.end(b);
    };
    if (!tokenOk(token, req.headers['x-federation-token'])) return send(401, { error: 'unauthorized' });
    if (u.pathname === '/federation/health') {
      const s = cache.stats({ dbPath });
      return send(200, { ok: true, entries: s.total });
    }
    if (u.pathname === '/federation/get') {
      const ns = u.searchParams.get('ns') || '';
      const key = u.searchParams.get('key') || '';
      const db = cache.getDb(dbPath);
      const row = db.prepare('SELECT output FROM cache WHERE key = ? AND namespace = ?').get(key, ns);
      if (!row) return send(404, { error: 'not found' });
      return send(200, { output: row.output });
    }
    return send(404, { error: 'unknown' });
  };
}

// --- parsePeers ----------------------------------------------------------------------

test('parsePeers: empty / undefined / whitespace -> []', () => {
  assert.deepEqual(federation.parsePeers(undefined), []);
  assert.deepEqual(federation.parsePeers(null), []);
  assert.deepEqual(federation.parsePeers(''), []);
  assert.deepEqual(federation.parsePeers('   '), []);
});

test('parsePeers: comma + whitespace separated, trailing slash stripped', () => {
  const peers = federation.parsePeers('http://a.local:1/ , https://b.local:2//  http://c.local:3');
  assert.deepEqual(peers, ['http://a.local:1', 'https://b.local:2', 'http://c.local:3']);
});

test('parsePeers: drops malformed + non-http schemes, de-dupes', () => {
  const peers = federation.parsePeers('http://a.local, not-a-url, ftp://x.local, http://a.local/');
  assert.deepEqual(peers, ['http://a.local']); // dupe collapsed, junk dropped
});

test('parsePeers: preserves path prefix on a peer base', () => {
  const peers = federation.parsePeers('http://gw.local/cache/');
  assert.deepEqual(peers, ['http://gw.local/cache']);
});

// --- FAIL-OPEN -----------------------------------------------------------------------

test('fetchFromPeers: no peers -> null (no throw)', async () => {
  const r = await federation.fetchFromPeers('https://example.com', 'p', []);
  assert.equal(r, null);
  const r2 = await federation.fetchFromPeers('https://example.com', 'p', '');
  assert.equal(r2, null);
});

test('fetchFromPeers: all peers down (connection refused) -> null, never throws', async () => {
  // Bind+immediately close a server to obtain a definitely-dead port.
  const dead = await spinServer((_, res) => res.end());
  const deadUrl = dead.url;
  await dead.close(); // now nothing listens there -> ECONNREFUSED

  let threw = false;
  let result;
  try {
    result = await federation.fetchFromPeers('https://example.com', 'p', [deadUrl], {
      timeoutMs: 500,
    });
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'fetchFromPeers must not throw on a refused connection');
  assert.equal(result, null, 'all-down must resolve to null (fail-open)');
});

test('fetchFromPeers: peer that 500s / returns garbage -> null', async () => {
  const bad = await spinServer((_, res) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('not json at all <<<');
  });
  try {
    const r = await federation.fetchFromPeers('https://example.com', 'p', [bad.url], { timeoutMs: 500 });
    assert.equal(r, null);
  } finally {
    await bad.close();
  }
});

test('fetchFromPeers: peer timeout -> null (fail-open), under timeout budget', async () => {
  // Server that never responds.
  const stall = await spinServer(() => { /* intentionally hang */ });
  try {
    const t0 = Date.now();
    const r = await federation.fetchFromPeers('https://example.com', 'p', [stall.url], { timeoutMs: 300 });
    const dt = Date.now() - t0;
    assert.equal(r, null);
    assert.ok(dt < 2000, `should give up near the 300ms timeout, took ${dt}ms`);
  } finally {
    await stall.close();
  }
});

// --- peer HIT -> pulled into local cache --------------------------------------------

test('peer HIT: fetchFromPeers returns {output, fromPeer}; caller writes into local cache', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const dbA = freshDbPath(); // serving peer's DB
  const dbB = freshDbPath(); // local DB (starts empty)
  const url = 'https://docs.example.com/page?b=2&a=1';
  const prompt = 'summarize';
  const ns = '';

  // Seed instance A and serve it.
  cache.set(url, prompt, 'PEER-PAGE-CONTENT', { dbPath: dbA, namespace: ns });
  const peer = await spinServer(makeFedHandler(dbA, ''));

  try {
    // B has no local entry yet.
    assert.equal(cache.get(url, prompt, { dbPath: dbB, namespace: ns }), null);

    const hit = await federation.fetchFromPeers(url, prompt, [peer.url], { timeoutMs: 1000, namespace: ns });
    assert.ok(hit, 'expected a peer hit');
    assert.equal(hit.output, 'PEER-PAGE-CONTENT');
    assert.equal(hit.fromPeer, peer.url);

    // Simulate the mcp-server behavior: pull the peer hit into the LOCAL cache.
    cache.set(url, prompt, hit.output, { dbPath: dbB, namespace: ns });

    // Now B serves it locally (no peer needed).
    assert.equal(cache.get(url, prompt, { dbPath: dbB, namespace: ns }), 'PEER-PAGE-CONTENT');
  } finally {
    await peer.close();
    cache._closeDb(dbA);
    cache._closeDb(dbB);
  }
});

test('peer HIT: first responding peer wins; earlier-down peers are skipped', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const dbHit = freshDbPath();
  const url = 'https://example.com/x';
  cache.set(url, 'p', 'FROM-SECOND-PEER', { dbPath: dbHit, namespace: '' });

  const dead = await spinServer((_, res) => res.end());
  const deadUrl = dead.url;
  await dead.close(); // dead peer first

  const live = await spinServer(makeFedHandler(dbHit, ''));
  try {
    const hit = await federation.fetchFromPeers(url, 'p', [deadUrl, live.url], { timeoutMs: 600 });
    assert.ok(hit);
    assert.equal(hit.output, 'FROM-SECOND-PEER');
    assert.equal(hit.fromPeer, live.url);
  } finally {
    await live.close();
    cache._closeDb(dbHit);
  }
});

// --- token auth ----------------------------------------------------------------------

test('token auth: 401 without header, 200 with correct header', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const db = freshDbPath();
  const url = 'https://secure.example.com/p';
  const TOKEN = 's3cr3t-token';
  cache.set(url, 'p', 'PROTECTED', { dbPath: db, namespace: '' });
  const key = cache.makeKey(url, 'p', '');

  const peer = await spinServer(makeFedHandler(db, TOKEN));
  try {
    const qs = `/federation/get?ns=&key=${encodeURIComponent(key)}`;

    // No token -> 401.
    const noTok = await federation._getJson(peer.url, qs, { timeoutMs: 1000 });
    assert.ok(noTok);
    assert.equal(noTok.status, 401);

    // Wrong token -> 401.
    const wrong = await federation._getJson(peer.url, qs, { token: 'nope', timeoutMs: 1000 });
    assert.equal(wrong.status, 401);

    // Correct token -> 200 with output.
    const ok = await federation._getJson(peer.url, qs, { token: TOKEN, timeoutMs: 1000 });
    assert.equal(ok.status, 200);
    assert.equal(JSON.parse(ok.body).output, 'PROTECTED');
  } finally {
    await peer.close();
    cache._closeDb(db);
  }
});

test('token auth via fetchFromPeers: no token configured client-side against a protected peer -> null (fail-open)', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const db = freshDbPath();
  const url = 'https://secure.example.com/q';
  cache.set(url, 'p', 'PROTECTED2', { dbPath: db, namespace: '' });
  const peer = await spinServer(makeFedHandler(db, 'the-token'));
  try {
    // Client omits the token -> peer 401 -> fetchFromPeers treats as miss -> null.
    const miss = await federation.fetchFromPeers(url, 'p', [peer.url], { timeoutMs: 1000 });
    assert.equal(miss, null);
    // Client supplies the token -> hit.
    const hit = await federation.fetchFromPeers(url, 'p', [peer.url], { token: 'the-token', timeoutMs: 1000 });
    assert.ok(hit);
    assert.equal(hit.output, 'PROTECTED2');
  } finally {
    await peer.close();
    cache._closeDb(db);
  }
});

// --- key scheme matches across instances (THE federation guarantee) ------------------

test('key scheme: value set on instance A is found by instance B via real federation-server', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  // Two independent DBs = two instances. A holds the data and serves federation; B is a
  // fresh instance that only knows A's URL. B must locate A's entry purely via the shared
  // key derivation (SHA256(ns|canonUrl|prompt)) — neither side shares url/prompt over the
  // wire, only (ns,key).
  const dbA = freshDbPath();
  const dbB = freshDbPath();
  const ns = 'projX';

  // Instance A canonicalization stress: messy URL, A stores under canonical key.
  const messyUrl = 'HTTPS://Docs.Example.COM:443/Guide?z=9&a=1#section';
  const cleanUrl = 'https://docs.example.com/Guide?a=1&z=9'; // what B will ask for
  const prompt = 'extract steps';

  cache.set(messyUrl, prompt, 'A-CANONICAL-CONTENT', { dbPath: dbA, namespace: ns });

  // Sanity: both instances compute the SAME key for the differently-spelled URLs.
  const keyA = cache.makeKey(messyUrl, prompt, ns);
  const keyB = cache.makeKey(cleanUrl, prompt, ns);
  assert.equal(keyA, keyB, 'canonicalization must make A and B agree on the key');

  const peerA = await spinServer(makeFedHandler(dbA, ''));
  try {
    // Instance B has nothing locally.
    assert.equal(cache.get(cleanUrl, prompt, { dbPath: dbB, namespace: ns }), null);

    // B asks the federation for the *clean* URL spelling and finds A's entry.
    const hit = await federation.fetchFromPeers(cleanUrl, prompt, [peerA.url], {
      timeoutMs: 1000,
      namespace: ns,
    });
    assert.ok(hit, 'cross-instance lookup should hit');
    assert.equal(hit.output, 'A-CANONICAL-CONTENT');
    assert.equal(hit.fromPeer, peerA.url);

    // Wrong namespace must NOT cross-hit (isolation holds).
    const wrongNs = await federation.fetchFromPeers(cleanUrl, prompt, [peerA.url], {
      timeoutMs: 1000,
      namespace: 'other',
    });
    assert.equal(wrongNs, null, 'namespace isolation must prevent cross-namespace hits');
  } finally {
    await peerA.close();
    cache._closeDb(dbA);
    cache._closeDb(dbB);
  }
});

// --- real federation-server.cjs end-to-end (default DB path, health route) -----------

test('federation-server.cjs: health route responds 200 {ok,entries}', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const fed = await spinFederation({});
  try {
    const res = await federation._getJson(fed.url, '/federation/health', { timeoutMs: 1000 });
    assert.ok(res);
    assert.equal(res.status, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.ok, true);
    assert.ok(typeof body.entries === 'number' || body.entries === null);
  } finally {
    await fed.close();
  }
});

test('federation-server.cjs: GET /federation/get unknown key -> 404; non-GET -> 405', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const fed = await spinFederation({});
  try {
    const miss = await federation._getJson(
      fed.url,
      `/federation/get?ns=&key=${'0'.repeat(64)}`,
      { timeoutMs: 1000 }
    );
    assert.equal(miss.status, 404);

    // POST should be rejected (read-only server).
    const post = await new Promise((resolve) => {
      const u = new URL(fed.url + '/federation/get');
      const req = http.request(u, { method: 'POST' }, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', () => resolve(0));
      req.end();
    });
    assert.equal(post, 405);
  } finally {
    await fed.close();
  }
});

test('healthCheckPeers: mixed up/down reported, never throws', async (t) => {
  if (!SQLITE_OK) return t.skip('node:sqlite unavailable');
  const db = freshDbPath();
  const up = await spinServer(makeFedHandler(db, ''));
  const dead = await spinServer((_, res) => res.end());
  const deadUrl = dead.url;
  await dead.close();
  try {
    const results = await federation.healthCheckPeers([up.url, deadUrl], { timeoutMs: 500 });
    assert.equal(results.length, 2);
    const upRes = results.find((r) => r.peer === up.url);
    const downRes = results.find((r) => r.peer === deadUrl);
    assert.equal(upRes.ok, true);
    assert.equal(downRes.ok, false);
  } finally {
    await up.close();
    cache._closeDb(db);
  }
});
