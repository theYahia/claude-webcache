#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// PreToolUse hook: serve WebFetch from qsearch's url-keyed full-page cache.
// stdin = JSON { tool_name, tool_input: { url } }   (prompt is no longer part of the key)
// On HIT/fetch  -> deny with the full-page markdown in the reason, so the model uses it
//                  instead of hitting the network. qsearch fetches+caches on miss.
// On any error / qsearch down -> emit nothing (fail-open; native WebFetch runs).
// Disable without uninstalling: WEBCACHE_AUTOREAD=0.

const q = require('./qsearch-client.cjs');

const DEBUG = process.env.WEBCACHE_DEBUG === '1';
const AUTOREAD = process.env.WEBCACHE_AUTOREAD !== '0';
// Above this size, point the model at the cached_fetch MCP tool instead of inlining.
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
    if (tool_name !== 'WebFetch') return;

    const url = (tool_input && tool_input.url) || '';
    if (!url) return;

    const v = q.validateUrl(url);
    if (!v.ok) return; // let WebFetch handle/refuse it

    const data = await q.urlContent(url); // { markdown, source } | null (fail-open)
    if (data == null) {
      logDebug(`miss/unavailable: ${url.slice(0, 80)}`);
      return; // miss or qsearch down -> allow WebFetch
    }

    const md = data.markdown;
    if (Buffer.byteLength(md, 'utf8') <= INLINE_MAX_BYTES) {
      emitDeny(
        `[claude-webcache] qsearch full-page for ${url} (${data.source}) — network fetch skipped. ` +
        `Use the content below; do NOT retry WebFetch for this URL.\n\n` +
        `=== PAGE CONTENT (markdown) ===\n${md}`
      );
    } else {
      emitDeny(
        `[claude-webcache] qsearch full-page for ${url} (large, ${data.source}) — network fetch skipped. ` +
        `Call the MCP tool cached_fetch with this url to read the cached copy.`
      );
    }
    logDebug(`served (${data.source}): ${url.slice(0, 80)}`);
  } catch (e) {
    q.logError('webfetch-precache hook error', e);
    // On any error, emit nothing so WebFetch proceeds normally (fail-open).
  }
});
