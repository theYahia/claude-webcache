# Changelog

## 0.1.2 — 2026-04-30

- restructure: move plugin metadata + scripts + src into `./plugin/` subdir, keep `marketplace.json` in repo root. Fixes "source type your Claude Code version does not support" on `/plugin install` for Claude Code 2.1.x — only relative-path string sources (must start with `./`) are reliably supported there for the plugin-source field.
- `marketplace.json` plugin source is now `"./plugin"` (matching the canonical relative-path form used by Anthropic's own claude-plugins-official marketplace).
- npm `main` updated to `plugin/src/cache.js`; `files` reduced to `plugin/`, `README.md`, `LICENSE`. Transparent to `require('@theyahia/claude-webcache')` consumers.

## 0.1.1 — 2026-04-30

- fix: MCP server path in `.mcp.json` — replace unresolved `${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.cjs` with relative `./scripts/mcp-server.cjs`
- fix: `marketplace.json` plugin `source` to canonical `{"source":"github","repo":"theYahia/claude-webcache"}` object form (was bare string `"."`, which Claude Code doesn't parse for plugins outside relative paths starting with `./`)

## 0.1.0 — 2026-04-30

- Initial release
- SQLite-backed cross-session WebFetch cache (`~/.webcache/cache.db`, WAL mode, 7-day TTL)
- 4 MCP tools: `cached_fetch`, `cache_store`, `cache_stats`, `cache_list`
- SessionStart hook printing one-line cache stats
- Claude Code plugin format — install via `/plugin install theYahia/claude-webcache`
