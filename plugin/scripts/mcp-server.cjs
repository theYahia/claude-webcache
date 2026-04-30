#!/usr/bin/env node
process.removeAllListeners('warning');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const cache = require('../src/cache.js');

const server = new Server(
  { name: 'claude-webcache', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: 'cached_fetch',
    description:
      'Look up a URL+prompt pair in the local WebFetch cache. Returns cached output if present (instant), or "[CACHE_MISS] <url>" if not. On CACHE_MISS, call WebFetch, then call cache_store with the result. Same URL+prompt across sessions hits the cache.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to fetch' },
        prompt: { type: 'string', description: 'The prompt/instruction for the WebFetch' },
      },
      required: ['url', 'prompt'],
    },
  },
  {
    name: 'cache_store',
    description:
      'Store a WebFetch result in the cache after a CACHE_MISS. Pass the original url, prompt, and the output text returned by WebFetch.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        prompt: { type: 'string' },
        output: { type: 'string', description: 'The output text returned by WebFetch' },
      },
      required: ['url', 'prompt', 'output'],
    },
  },
  {
    name: 'cache_stats',
    description: 'Return cache statistics: total entries, total hits, last cached timestamp.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cache_list',
    description: 'List recently cached URLs (most recent first).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max entries to return (default 50)' },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    if (name === 'cached_fetch') {
      const { url, prompt } = args || {};
      if (!url || !prompt) {
        return { content: [{ type: 'text', text: 'Error: url and prompt are required' }], isError: true };
      }
      const hit = cache.get(url, prompt);
      if (hit) {
        return { content: [{ type: 'text', text: hit }] };
      }
      return { content: [{ type: 'text', text: `[CACHE_MISS] ${url}` }] };
    }

    if (name === 'cache_store') {
      const { url, prompt, output } = args || {};
      if (!url || !prompt || !output) {
        return { content: [{ type: 'text', text: 'Error: url, prompt, output required' }], isError: true };
      }
      cache.set(url, prompt, output);
      return { content: [{ type: 'text', text: 'stored' }] };
    }

    if (name === 'cache_stats') {
      const s = cache.stats();
      return { content: [{ type: 'text', text: JSON.stringify(s) }] };
    }

    if (name === 'cache_list') {
      const limit = (args && typeof args.limit === 'number') ? args.limit : 50;
      const rows = cache.list(limit);
      return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
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
