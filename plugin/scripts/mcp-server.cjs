#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// webcache is now a qsearch companion: all storage lives in qsearch (corpus +
// query cache). These MCP tools are thin manual lookups against a running qsearch;
// the hooks do auto-read/auto-cache transparently, so these are rarely needed.
const q = require('./qsearch-client.cjs');
const PLUGIN_MANIFEST = require('../.claude-plugin/plugin.json');

// Federation MVP (v0.7.0): on a local miss, optionally pull from peer instances.
// Pure-stdlib, fail-open everywhere — see plugin/src/federation.js. The federation HTTP
// *server* runs as a separate process (cli.cjs federation); here we only ever act as a
// federation *client* on the cached_fetch miss path.
const federation = require('../src/federation.js');
const cache = require('../src/cache.js');

const FED_PEERS = federation.parsePeers(process.env.WEBCACHE_PEERS);
const FED_TOKEN = process.env.WEBCACHE_FEDERATION_TOKEN || undefined;
const FED_TIMEOUT_MS = Number(process.env.WEBCACHE_FEDERATION_TIMEOUT_MS) || undefined;
const FED_NAMESPACE = process.env.WEBCACHE_NAMESPACE || '';
// In-process counters surfaced by cache_federation_stats (reset each server start).
const fedCounters = { hits: 0, misses: 0, lastPeer: null, lastHitAt: null };

const server = new Server(
  { name: 'claude-webcache', version: PLUGIN_MANIFEST.version },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: 'cached_fetch',
    description:
      'Fetch a URL as clean full-page markdown via qsearch (url-keyed, cross-session). Returns the page content (corpus hit or freshly fetched+cached), or "[CACHE_MISS] <url>" if qsearch is unreachable. Same URL reused across prompts/sessions hits the corpus. If WEBCACHE_PEERS is set, a local+qsearch miss falls back to federated peers; a peer hit is written into the local cache and returned (fail-open: peer/network errors behave like no peers).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to fetch' },
        prompt: { type: 'string', description: 'Optional; ignored for keying (kept for call-site compatibility)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'cached_search',
    description:
      'Look up a WebSearch query in qsearch\'s query cache. Returns cached results if a fresh entry exists, or "[CACHE_MISS] <query>" if not. On miss, run WebSearch — the PostToolUse hook stores the result automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'cache_stats',
    description:
      'Return webcache→qsearch backend status: corpus document total, webfetch-namespace count, and query-cache hit rate. Reports {up:false} if qsearch is unreachable.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cache_federation_stats',
    description:
      'Report federation (multi-instance) configuration and activity: configured peers, namespace, token-enabled flag, this session\'s federated hit/miss counts, last peer that served a hit, and best-effort per-peer health. Empty peers => federation disabled.',
    inputSchema: { type: 'object', properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    if (name === 'cached_fetch') {
      const { url } = args || {};
      if (!url) {
        return { content: [{ type: 'text', text: 'Error: url is required' }], isError: true };
      }
      const v = q.validateUrl(url);
      if (!v.ok) {
        return { content: [{ type: 'text', text: `Error: ${v.reason}` }], isError: true };
      }
      const { prompt } = args || {};

      // 1) Local cache (the store federation peers also serve from). Fail-open: any
      //    sqlite issue returns null and we fall through.
      try {
        const localHit = cache.get(url, prompt, { namespace: FED_NAMESPACE });
        if (localHit != null) {
          return { content: [{ type: 'text', text: localHit }] };
        }
      } catch { /* fail-open */ }

      // 2) qsearch (the live backend).
      const data = await q.urlContent(url);
      if (data && data.markdown) {
        return { content: [{ type: 'text', text: data.markdown }] };
      }

      // 3) LOCAL MISS -> try federated peers (only if configured). On a peer hit, write
      //    it into the LOCAL cache so future lookups (local + as a peer ourselves) hit,
      //    then return it marked fromPeer. Entirely fail-open.
      if (FED_PEERS.length) {
        const peerHit = await federation.fetchFromPeers(url, prompt, FED_PEERS, {
          token: FED_TOKEN,
          timeoutMs: FED_TIMEOUT_MS,
          namespace: FED_NAMESPACE,
        });
        if (peerHit && peerHit.output) {
          fedCounters.hits += 1;
          fedCounters.lastPeer = peerHit.fromPeer;
          fedCounters.lastHitAt = Date.now();
          try {
            cache.set(url, prompt, peerHit.output, { namespace: FED_NAMESPACE });
          } catch { /* fail-open: still return the content even if local write fails */ }
          return {
            content: [{ type: 'text', text: peerHit.output }],
            _meta: { fromPeer: peerHit.fromPeer },
          };
        }
        fedCounters.misses += 1;
      }

      return { content: [{ type: 'text', text: `[CACHE_MISS] ${url}` }] };
    }

    if (name === 'cached_search') {
      const { query } = args || {};
      if (!query) {
        return { content: [{ type: 'text', text: 'Error: query is required' }], isError: true };
      }
      const hit = await q.searchLookup(query);
      if (hit != null) {
        return { content: [{ type: 'text', text: hit }] };
      }
      return { content: [{ type: 'text', text: `[CACHE_MISS] ${query}` }] };
    }

    if (name === 'cache_stats') {
      const s = await q.stats();
      return { content: [{ type: 'text', text: JSON.stringify(s) }] };
    }

    if (name === 'cache_federation_stats') {
      const out = {
        enabled: FED_PEERS.length > 0,
        peers: FED_PEERS,
        namespace: FED_NAMESPACE,
        token_enabled: !!FED_TOKEN,
        timeout_ms: FED_TIMEOUT_MS || federation.DEFAULT_TIMEOUT_MS,
        session: {
          hits: fedCounters.hits,
          misses: fedCounters.misses,
          last_peer: fedCounters.lastPeer,
          last_hit_at: fedCounters.lastHitAt,
        },
        peer_health: [],
      };
      if (FED_PEERS.length) {
        // Best-effort health probe; never throws (healthCheckPeers is fail-open).
        out.peer_health = await federation.healthCheckPeers(FED_PEERS, {
          token: FED_TOKEN,
          timeoutMs: FED_TIMEOUT_MS,
        });
      }
      return { content: [{ type: 'text', text: JSON.stringify(out) }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
