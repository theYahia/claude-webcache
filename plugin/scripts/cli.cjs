#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

const cache = require('../src/cache.js');
const PLUGIN_MANIFEST = require('../.claude-plugin/plugin.json');

const args = process.argv.slice(2);
const cmd = args[0];

function help() {
  process.stdout.write(`claude-webcache v${PLUGIN_MANIFEST.version} — local WebFetch cache CLI

Usage:
  claude-webcache <command> [args]

Commands:
  stats                       Print cache statistics as JSON.
  list [N]                    List N most-recent URLs (default 50).
  invalidate <url>            Delete all entries for a URL.
  clear [--older-than-days N] Wipe cache. Without --older-than-days, requires --confirm YES.
  dashboard [--port N]        Launch web dashboard on http://localhost:N (default 37778).
  help                        Show this message.

Environment:
  WEBCACHE_TTL_DAYS=N         Global TTL in days (default unlimited).
  WEBCACHE_MAX_SIZE_MB=N      Trigger LRU eviction above this size (default unlimited).
  WEBCACHE_DOMAIN_TTL='{...}' Per-domain TTL JSON (e.g. '{"news.com":1,"arxiv.org":0}').
  WEBCACHE_DEBUG=1            Enable hook stderr logging.

DB path: ${cache.DB_PATH}
`);
}

function flag(name, hasValue = false) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return hasValue ? args[i + 1] : true;
}

(function main() {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    help();
    process.exit(0);
  }

  if (cmd === 'stats') {
    process.stdout.write(JSON.stringify(cache.stats(), null, 2) + '\n');
    return;
  }

  if (cmd === 'list') {
    const n = Number(args[1]) || 50;
    process.stdout.write(JSON.stringify(cache.list(n), null, 2) + '\n');
    return;
  }

  if (cmd === 'invalidate') {
    const url = args[1];
    if (!url) {
      process.stderr.write('Error: invalidate requires a URL argument\n');
      process.exit(2);
    }
    const deleted = cache.invalidate(url);
    process.stdout.write(JSON.stringify({ deleted }) + '\n');
    return;
  }

  if (cmd === 'clear') {
    const olderRaw = flag('--older-than-days', true);
    const confirm = flag('--confirm', true);
    const olderThan = olderRaw ? Number(olderRaw) : undefined;
    if (!olderThan && confirm !== 'YES') {
      process.stderr.write('Error: full wipe requires --confirm YES, or pass --older-than-days N for partial.\n');
      process.exit(2);
    }
    const deleted = cache.clear(olderThan);
    process.stdout.write(JSON.stringify({ deleted }) + '\n');
    return;
  }

  if (cmd === 'dashboard') {
    const port = Number(flag('--port', true)) || 37778;
    require('./dashboard.cjs').start(port);
    return;
  }

  process.stderr.write(`Unknown command: ${cmd}\n\n`);
  help();
  process.exit(2);
})();
