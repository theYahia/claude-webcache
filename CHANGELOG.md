# Changelog

## 0.2.0 — 2026-05-01

- Add `node:test` unit suite (`plugin/test/cache.test.js`, 8 tests, ~400ms) covering `makeKey` determinism, `set`/`get` round-trip, hit-count update, TTL expiry, upsert, `purgeExpired` Infinity no-op behavior, and `stats` aggregation. Zero new devDeps — uses Node 22.5+ built-in test runner.
- Add `bench/run.js` — single-process latency + storage benchmark (`npm run bench`). Measures p50/p95/p99 for write / read hit / read miss / list operations and bytes-per-entry. Saves JSON results with full machine metadata (CPU, RAM, OS, Node version, commit) for reproducible before/after comparisons.
- Add `bench/README.md` documenting methodology and expected numbers.
- Extend `.github/workflows/test.yml`: real `npm test` job now runs on every push/PR. The existing `npm publish --dry-run` job now depends on tests passing.
- Replace unmeasured "5-15× fewer WebFetch calls" headline in README with measured latency claim from the benchmark suite. Add `Benchmarks` section with the actual numbers and a reproduce command.
- Bump version in `package.json`, `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`.

## 0.1.5 — 2026-04-30

- Auto-cache every WebFetch via a `PostToolUse` hook (`plugin/scripts/hook-webfetch-cache.cjs`). The "before WebFetch, call `cached_fetch` first" pattern in CLAUDE.md becomes optional — caching now happens transparently after each WebFetch returns.
- README updated: usage pattern moved under "optional" for pre-fetch checks.

## 0.1.4 — 2026-04-30

- Default cache TTL changed to **unlimited** (was 7 days). Set `WEBCACHE_TTL_DAYS=N` to opt back into N-day expiry. Rationale: cached docs/arxiv pages rarely become stale within research-sprint horizons; explicit user choice beats silent expiry.

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
