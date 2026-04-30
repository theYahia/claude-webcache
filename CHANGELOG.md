# Changelog

## 0.1.3 — 2026-04-30

- Add `mcpName` field to package.json (`io.github.theYahia/claude-webcache`) — required by the Official MCP Registry (registry.modelcontextprotocol.io) for ownership verification when publishing the corresponding `server.json`. No code changes; metadata-only.

## 0.1.2 — 2026-04-30

- Restructured plugin into `./plugin/` subdir to match the canonical relative-path layout used by Anthropic's claude-plugins-official and thedotmack/claude-mem marketplaces.
- `marketplace.json` plugin source is now `"./plugin"`.
- npm `main` updated to `plugin/src/cache.js`; `files` reduced to `plugin/`, `README.md`, `LICENSE`. Transparent to `require('@theyahia/claude-webcache')` consumers.

> Note on TUI install: at time of release, `/plugin install` in the Claude Code TUI fails for all third-party plugins on Windows due to an upstream Anthropic backend bug ([anthropics/claude-code#41653](https://github.com/anthropics/claude-code/issues/41653)) — independent of source format. CLI subcommands (`claude plugin marketplace add` + `claude plugin install`) bypass this and work; see README.

## 0.1.1 — 2026-04-30

- fix: MCP server path in `.mcp.json` — replace unresolved `${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.cjs` with relative `./scripts/mcp-server.cjs`. Resolves "Failed to reconnect to claude-webcache" on plugin install.
- Switched `marketplace.json` plugin source to canonical `{"source":"github","repo":"theYahia/claude-webcache"}` object form per Claude Code marketplace docs.

## 0.1.0 — 2026-04-30

- Initial release
- SQLite-backed cross-session WebFetch cache (`~/.webcache/cache.db`, WAL mode, 7-day TTL)
- 4 MCP tools: `cached_fetch`, `cache_store`, `cache_stats`, `cache_list`
- SessionStart hook printing one-line cache stats
- Claude Code plugin format — install via `/plugin install theYahia/claude-webcache`
