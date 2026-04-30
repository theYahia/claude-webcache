# Changelog

## 0.1.1 — 2026-04-30

- fix: MCP server path in `.mcp.json` — replace unresolved `${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.cjs` with relative `./scripts/mcp-server.cjs`
- fix: `marketplace.json` plugin `source` to canonical `{"source":"github","repo":"theYahia/claude-webcache"}` object form (was bare string `"."`, which Claude Code doesn't parse for plugins outside relative paths starting with `./`)

## 0.1.0 — 2026-04-30

- Initial release
- SQLite-backed cross-session WebFetch cache (`~/.webcache/cache.db`, WAL mode, 7-day TTL)
- 4 MCP tools: `cached_fetch`, `cache_store`, `cache_stats`, `cache_list`
- SessionStart hook printing one-line cache stats
- Claude Code plugin format — install via `/plugin install theYahia/claude-webcache`
