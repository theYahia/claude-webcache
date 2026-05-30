#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// PostToolUse hook: store every native WebSearch result into qsearch's query cache.
// stdin = JSON { tool_name, tool_input: { query }, tool_response: <results> }
// Native WebSearch runs through Anthropic's server-side tool — qsearch never sees it,
// so we capture the result here and POST it to /cache_store for next-time reuse.
// WebSearch response shape isn't contractually fixed → extract defensively.

const q = require('./qsearch-client.cjs');

const DEBUG = process.env.WEBCACHE_DEBUG === '1';

function logDebug(line) {
  if (!DEBUG) return;
  try { process.stderr.write(`[claude-webcache] ${line}\n`); } catch {}
}

function extractOutput(resp) {
  if (resp == null) return '';
  if (typeof resp === 'string') return resp;
  // Common shape: { content: [{ type: 'text', text }] }
  if (Array.isArray(resp.content)) {
    const texts = resp.content.filter((c) => c && c.type === 'text' && c.text).map((c) => c.text);
    if (texts.length) return texts.join('\n');
  }
  // Some platforms wrap results in arrays/objects — dump them.
  try { return JSON.stringify(resp); } catch { return ''; }
}

let raw = '';
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', async () => {
  try {
    const { tool_name, tool_input, tool_response } = JSON.parse(raw || '{}');
    if (tool_name !== 'WebSearch') return;

    const query = (tool_input && tool_input.query) || '';
    const output = extractOutput(tool_response);
    if (!query || !output) {
      logDebug(`skip: missing query or output (query=${!!query}, output=${!!output})`);
      return;
    }

    const ok = await q.searchStore(query, output);
    if (!ok) { logDebug(`store failed/unavailable: ${query.slice(0, 80)}`); return; }
    logDebug(`cached search: ${query.slice(0, 80)} (${output.length} bytes)`);
  } catch (e) {
    q.logError('websearch-cache hook error', e);
  }
});
