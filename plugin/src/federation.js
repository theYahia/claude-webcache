'use strict';
// Federation — pure logic for multi-instance cache sharing (the deferred "Not
// multi-machine" non-goal in ARCHITECTURE.md). No I/O of its own beyond outbound HTTP
// GETs to configured peers. Pure Node stdlib (node:http, node:https, node:url) + cache.js
// for the shared key scheme.
//
// FAIL-OPEN CONTRACT (non-negotiable): every error path — no peers, malformed peer URL,
// connection refused, timeout, non-200, bad JSON, missing field — resolves to `null`
// (for fetchFromPeers) or an empty list (for parsePeers). It NEVER throws and NEVER
// blocks: a peer miss/outage behaves EXACTLY like "no peers configured".
//
// Key agreement: peers are looked up by the SAME key cache.js derives —
// SHA256(namespace + '|' + canonUrl(url) + '|' + prompt). Because that derivation is
// deterministic and self-contained, instance A and instance B compute the identical key
// for the same (namespace, url, prompt). The federation HTTP wire protocol passes
// (namespace, key) so the serving peer needs no knowledge of the original url/prompt.

const http = require('node:http');
const https = require('node:https');
const cache = require('./cache.js');

const DEFAULT_TIMEOUT_MS = 2000;

// parsePeers(env) -> string[] of normalized base URLs (trailing slash stripped).
// Accepts a comma- (and/or whitespace-) separated list. Invalid entries are dropped
// silently — a typo in one peer must not break the others. Self/dupes are de-duplicated.
function parsePeers(env) {
  const raw = env == null ? '' : String(env);
  if (!raw.trim()) return [];
  const seen = new Set();
  const out = [];
  for (const part of raw.split(/[,\s]+/)) {
    const s = part.trim();
    if (!s) continue;
    let u;
    try {
      u = new URL(s);
    } catch {
      continue; // skip malformed peer
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') continue;
    const base = u.origin + (u.pathname === '/' ? '' : u.pathname.replace(/\/+$/, ''));
    const norm = base.replace(/\/+$/, '');
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

// Low-level single GET with a hard timeout. Resolves { status, body } or null on ANY
// error/timeout. Never rejects.
function _getJson(peerBase, pathWithQuery, { token, timeoutMs } = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    let target;
    try {
      target = new URL(peerBase + pathWithQuery);
    } catch {
      return done(null);
    }
    const lib = target.protocol === 'https:' ? https : http;
    const headers = {};
    if (token) headers['X-Federation-Token'] = token;
    let req;
    try {
      req = lib.request(
        target,
        { method: 'GET', headers, timeout: timeoutMs || DEFAULT_TIMEOUT_MS },
        (res) => {
          const chunks = [];
          let len = 0;
          res.on('data', (c) => {
            chunks.push(c);
            len += c.length;
            // Defensive cap so a misbehaving peer can't OOM us (8 MB).
            if (len > 8 * 1024 * 1024) {
              try {
                req.destroy();
              } catch {}
              done(null);
            }
          });
          res.on('end', () => {
            const status = res.statusCode || 0;
            const text = Buffer.concat(chunks).toString('utf8');
            done({ status, body: text });
          });
          res.on('error', () => done(null));
        }
      );
    } catch {
      return done(null);
    }
    req.on('error', () => done(null)); // ECONNREFUSED, ENOTFOUND, etc. -> fail-open
    req.on('timeout', () => {
      try {
        req.destroy();
      } catch {}
      done(null);
    });
    try {
      req.end();
    } catch {
      done(null);
    }
  });
}

// fetchFromPeers(url, prompt, peers, opts?) -> { output, fromPeer } | null
// Tries each peer in order; returns the FIRST hit. opts: { token, timeoutMs, namespace }.
// Any/all failures -> null (fail-open, identical to "no peers").
async function fetchFromPeers(url, prompt, peers, opts = {}) {
  try {
    const list = Array.isArray(peers) ? peers : parsePeers(peers);
    if (!list.length) return null;
    const namespace = opts.namespace != null ? opts.namespace : cache.NAMESPACE;
    const key = cache.makeKey(url, prompt, namespace);
    const qs =
      '/federation/get?ns=' +
      encodeURIComponent(namespace) +
      '&key=' +
      encodeURIComponent(key);

    for (const peer of list) {
      const res = await _getJson(peer, qs, {
        token: opts.token,
        timeoutMs: opts.timeoutMs || DEFAULT_TIMEOUT_MS,
      });
      if (!res || res.status !== 200 || !res.body) continue; // miss/down/401 -> next peer
      let data;
      try {
        data = JSON.parse(res.body);
      } catch {
        continue;
      }
      if (data && typeof data.output === 'string' && data.output.length) {
        return { output: data.output, fromPeer: peer };
      }
    }
    return null;
  } catch {
    // Absolute backstop — fetchFromPeers must never throw.
    return null;
  }
}

// healthCheckPeers(peers, opts?) -> [{ peer, ok, entries|null }]. Best-effort, never throws.
async function healthCheckPeers(peers, opts = {}) {
  const list = Array.isArray(peers) ? peers : parsePeers(peers);
  const results = [];
  for (const peer of list) {
    const res = await _getJson(peer, '/federation/health', {
      token: opts.token,
      timeoutMs: opts.timeoutMs || DEFAULT_TIMEOUT_MS,
    });
    if (res && res.status === 200 && res.body) {
      try {
        const d = JSON.parse(res.body);
        results.push({ peer, ok: !!d.ok, entries: d.entries ?? null });
        continue;
      } catch {}
    }
    results.push({ peer, ok: false, entries: null });
  }
  return results;
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  parsePeers,
  fetchFromPeers,
  healthCheckPeers,
  _getJson,
};
