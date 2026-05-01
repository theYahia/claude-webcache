#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// PostToolUse hook: auto-cache every WebFetch result into SQLite.
// stdin = JSON { tool_name, tool_input: { url, prompt }, tool_response: { content: [{type,text}] } }
const cache = require('../src/cache.js');

let raw = '';
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  try {
    const { tool_name, tool_input, tool_response } = JSON.parse(raw);
    if (tool_name !== 'WebFetch') return;

    const url = (tool_input && tool_input.url) || '';
    const prompt = (tool_input && tool_input.prompt) || '';
    const textBlock = tool_response && tool_response.content &&
      tool_response.content.find((c) => c.type === 'text');
    const output = (textBlock && textBlock.text) || '';

    if (url && output) {
      cache.set(url, prompt, output);
    }
  } catch (_) {
    // never crash the hook
  }
});
