#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// federation-server — a SEPARATE HTTP process (like dashboard.cjs was) that exposes
// READ-ONLY cache lookups to peer instances. It is deliberately NOT loaded inside the
// stdio MCP server: the MCP plugin stays stdio-pure, federation listens on its own port.
//
// Routes:
//   GET /federation/get?ns=<namespace>&key=<sha256key>  -> 200 { output } | 404 { error }
//   GET /federation/health                              -> 200 { ok, entries }
// Binding: 127.0.0.1 by default (WEBCACHE_FEDERATION_HOST), port 37779
//          (WEBCACHE_FEDERATION_PORT).
// Auth: if WEBCACHE_FEDERATION_TOKEN is set, every request must carry a matching
//       X-Federation-Token header (timing-safe compare) or it's 401. No token configured
//       => open on loopback (the default bind makes it local-only anyway).
//
// Reuses plugin/src/cache.js — the same SQLite store the MCP server writes peer hits into.

const http = require('node:http');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const cache = require('../src/cache.js');

const HOST = process.env.WEBCACHE_FEDERATION_HOST || '127.0.0.1';
const PORT = Number(process.env.WEBCACHE_FEDERATION_PORT) || 37779;
const TOKEN = process.env.WEBCACHE_FEDERATION_TOKEN || '';
const DEBUG = process.env.WEBCACHE_DEBUG === '1';

function logDebug(line) {
  if (!DEBUG) return;
  try {
    process.stderr.write(`[claude-webcache federation] ${line}\n`);
  } catch {}
}

// Timing-safe token compare. Lengths may differ -> hash both to a fixed width first so
// timingSafeEqual gets equal-length buffers and we never leak length via early return.
function tokenOk(provided) {
  if (!TOKEN) return true; // no token configured -> auth disabled
  const a = crypto.createHash('sha256').update(String(provided || ''), 'utf8').digest();
  const b = crypto.createHash('sha256').update(TOKEN, 'utf8').digest();
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function handle(req, res) {
  // Read-only server: anything other than GET is rejected.
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method not allowed' });
  }

  let parsed;
  try {
    parsed = new URL(req.url, `http://${HOST}:${PORT}`);
  } catch {
    return sendJson(res, 400, { error: 'bad request' });
  }
  const pathname = parsed.pathname;

  // Auth gate (applies to all federation routes).
  if (!tokenOk(req.headers['x-federation-token'])) {
    logDebug(`401 ${pathname}`);
    return sendJson(res, 401, { error: 'unauthorized' });
  }

  if (pathname === '/federation/health') {
    let entries = null;
    try {
      const s = cache.stats();
      entries = s.available ? s.total : null;
    } catch {
      entries = null;
    }
    return sendJson(res, 200, { ok: true, entries });
  }

  if (pathname === '/federation/get') {
    const ns = parsed.searchParams.get('ns') || '';
    const key = parsed.searchParams.get('key') || '';
    if (!key) return sendJson(res, 400, { error: 'missing key' });
    let output = null;
    try {
      // Look up by raw key directly (peer already computed it). Bypass cache.get's
      // url/prompt hashing — instances agree on the key, not the source url/prompt.
      const db = cache.getDb();
      const row = db
        .prepare('SELECT output FROM cache WHERE key = ? AND namespace = ?')
        .get(key, ns);
      if (row) {
        output = row.output;
        // Count the cross-instance hit on the serving side too.
        try {
          db.prepare(
            'UPDATE cache SET hit_count = hit_count + 1, last_hit_at = ? WHERE key = ?'
          ).run(Date.now(), key);
        } catch {}
      }
    } catch (e) {
      // sqlite unavailable / read error -> behave as a miss (fail-open for the peer too).
      logDebug(`lookup error: ${e.message}`);
      output = null;
    }
    if (output == null) {
      logDebug(`404 ns=${ns} key=${key.slice(0, 12)}…`);
      return sendJson(res, 404, { error: 'not found' });
    }
    logDebug(`200 ns=${ns} key=${key.slice(0, 12)}… (${output.length}b)`);
    return sendJson(res, 200, { output });
  }

  return sendJson(res, 404, { error: 'unknown route' });
}

function createServer() {
  return http.createServer((req, res) => {
    try {
      handle(req, res);
    } catch (e) {
      // Never let a handler throw take down the process.
      try {
        sendJson(res, 500, { error: 'internal' });
      } catch {}
      logDebug(`handler threw: ${e.message}`);
    }
  });
}

// start(opts?) -> { server, port, host } via callback-style promise. Exported so tests
// can spin an ephemeral instance (port 0) without shelling out.
function start({ host = HOST, port = PORT } = {}) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(port, host, () => {
      const addr = server.address();
      resolve({ server, host, port: addr && addr.port ? addr.port : port });
    });
  });
}

module.exports = { createServer, start, tokenOk };

// Launched directly (via `cli.cjs federation`) -> bind and run.
if (require.main === module) {
  start()
    .then(({ port, host }) => {
      const auth = TOKEN ? 'token-protected' : 'no token (loopback-only by default)';
      process.stdout.write(
        `[claude-webcache] federation server on http://${host}:${port} (${auth})\n` +
          `  GET /federation/get?ns=&key=   GET /federation/health\n`
      );
    })
    .catch((e) => {
      process.stderr.write(`[claude-webcache] federation server failed to start: ${e.message}\n`);
      process.exitCode = 1;
    });
}
