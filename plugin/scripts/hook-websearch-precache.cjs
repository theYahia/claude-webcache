#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// PreToolUse hook: serve WebSearch from qsearch's query cache when a fresh entry exists.
// stdin = JSON { tool_name, tool_input: { query } }
// On HIT  -> deny with the cached results inlined.
// On MISS / qsearch down -> emit nothing (native WebSearch runs; PostToolUse stores it).
// Disable without uninstalling: WEBCACHE_AUTOREAD=0.

const q = require('./qsearch-client.cjs');

const DEBUG = process.env.WEBCACHE_DEBUG === '1';
const AUTOREAD = process.env.WEBCACHE_AUTOREAD !== '0';
const INLINE_MAX_BYTES = 512 * 1024;

function logDebug(line) {
  if (!DEBUG) return;
  try { process.stderr.write(`[claude-webcache] ${line}\n`); } catch {}
}

function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
}

let raw = '';
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', async () => {
  try {
    if (!AUTOREAD) return;
    const { tool_name, tool_input } = JSON.parse(raw || '{}');
    if (tool_name !== 'WebSearch') return;

    const query = (tool_input && tool_input.query) || '';
    if (!query) return;

    const hit = await q.searchLookup(query); // results text on hit, null on miss/down
    if (hit == null) {
      logDebug(`miss: ${query.slice(0, 80)}`);
      return;
    }

    if (Buffer.byteLength(hit, 'utf8') <= INLINE_MAX_BYTES) {
      emitDeny(
        `[claude-webcache] Cached WebSearch results for "${query}" — search skipped. ` +
        `Use the cached results below; do NOT retry WebSearch for this query.\n\n` +
        `=== CACHED SEARCH RESULTS ===\n${hit}`
      );
    } else {
      emitDeny(
        `[claude-webcache] Cached WebSearch results for "${query}" (large) — search skipped. ` +
        `Call the MCP tool cached_search with this query to read the cached results.`
      );
    }
    logDebug(`hit served: ${query.slice(0, 80)}`);
  } catch (e) {
    q.logError('websearch-precache hook error', e);
  }
});
