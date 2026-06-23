#!/usr/bin/env node
'use strict';
process.removeAllListeners('warning');

// claude-webcache CLI. Re-introduced in v0.7.0 for the federation MVP.
//
// History: the full SQLite-era CLI (stats/list/invalidate/dashboard/…) was removed in
// v0.6.0 with the qsearch pivot. This slim CLI exists primarily to launch the federation
// server in its own process (keeping the MCP plugin stdio-pure) plus a couple of
// federation diagnostics. Everyday cache reads/writes go through the hooks + qsearch.
//
// Usage:
//   claude-webcache federation [--host H] [--port P]   # run the peer-lookup HTTP server
//   claude-webcache federation-status                  # ping configured WEBCACHE_PEERS
//   claude-webcache help

const path = require('node:path');

function printHelp() {
  process.stdout.write(
    `claude-webcache — federation CLI\n\n` +
      `Commands:\n` +
      `  federation [--host H] [--port P]   Start the read-only peer-lookup HTTP server\n` +
      `                                     (env: WEBCACHE_FEDERATION_HOST/PORT/TOKEN).\n` +
      `  federation-status                  Health-check the peers in WEBCACHE_PEERS.\n` +
      `  help                               This message.\n\n` +
      `Federation env:\n` +
      `  WEBCACHE_PEERS               comma-separated peer base URLs to query on local miss\n` +
      `  WEBCACHE_FEDERATION_HOST     bind host for the server (default 127.0.0.1)\n` +
      `  WEBCACHE_FEDERATION_PORT     bind port for the server (default 37779)\n` +
      `  WEBCACHE_FEDERATION_TOKEN    shared secret; required as X-Federation-Token if set\n` +
      `  WEBCACHE_FEDERATION_TIMEOUT_MS  per-peer request timeout (default 2000)\n`
  );
}

function parseFlags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--host') out.host = argv[++i];
    else if (a === '--port') out.port = Number(argv[++i]);
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    return printHelp();
  }

  if (cmd === 'federation') {
    // Launch the federation server in THIS process (it's already a separate process from
    // the MCP server). We require the module and call start() so flags/env are honored.
    const fed = require(path.join(__dirname, 'federation-server.cjs'));
    const flags = parseFlags(rest);
    const opts = {};
    if (flags.host) opts.host = flags.host;
    if (flags.port) opts.port = flags.port;
    try {
      const { host, port } = await fed.start(opts);
      const auth = process.env.WEBCACHE_FEDERATION_TOKEN ? 'token-protected' : 'no token';
      process.stdout.write(
        `[claude-webcache] federation server on http://${host}:${port} (${auth})\n`
      );
      // Keep the process alive; the http server holds the event loop open.
    } catch (e) {
      process.stderr.write(`[claude-webcache] federation server failed: ${e.message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (cmd === 'federation-status') {
    const federation = require(path.join(__dirname, '..', 'src', 'federation.js'));
    const peers = federation.parsePeers(process.env.WEBCACHE_PEERS);
    if (!peers.length) {
      process.stdout.write('No peers configured (WEBCACHE_PEERS empty).\n');
      return;
    }
    const timeoutMs = Number(process.env.WEBCACHE_FEDERATION_TIMEOUT_MS) || undefined;
    const results = await federation.healthCheckPeers(peers, {
      token: process.env.WEBCACHE_FEDERATION_TOKEN || undefined,
      timeoutMs,
    });
    for (const r of results) {
      const state = r.ok ? `up (${r.entries ?? '?'} entries)` : 'down/unreachable';
      process.stdout.write(`  ${r.peer} — ${state}\n`);
    }
    return;
  }

  process.stderr.write(`Unknown command: ${cmd}\nRun "claude-webcache help".\n`);
  process.exitCode = 1;
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exitCode = 1;
});
