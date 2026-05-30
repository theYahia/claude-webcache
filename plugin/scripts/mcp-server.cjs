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

const server = new Server(
  { name: 'claude-webcache', version: PLUGIN_MANIFEST.version },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: 'cached_fetch',
    description:
      'Fetch a URL as clean full-page markdown via qsearch (url-keyed, cross-session). Returns the page content (corpus hit or freshly fetched+cached), or "[CACHE_MISS] <url>" if qsearch is unreachable. Same URL reused across prompts/sessions hits the corpus.',
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
      const data = await q.urlContent(url);
      if (data && data.markdown) {
        return { content: [{ type: 'text', text: data.markdown }] };
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

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
