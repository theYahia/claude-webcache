# Migration guide

Every release ships an automatic schema migration on first DB open — no manual steps unless flagged below. `cache.js` uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` for forward compatibility.

## v0.2.x → v0.3.0

Adds:

- New `meta` table for global counters (`miss_count`, `evict_count`). Auto-created on first open.
- New index `idx_last_hit_at` on `cache.last_hit_at` to speed LRU eviction queries.

**Action required:** none. Existing `~/.webcache/cache.db` keeps working; the new table/index appear automatically on first read or write under v0.3.0.

**Behavior changes:**

- `cache_stats` MCP tool now returns a richer object: adds `misses`, `hit_rate`, `db_size_bytes`, `evicted`, `top_urls` to the previous `{ total, hits, last }` shape. Existing fields are preserved. If you parse the response, switch to keyed access (you should already).
- New tools `cache_invalidate` and `cache_clear` are registered. Existing 4 tools unchanged.
- `WEBCACHE_DOMAIN_TTL` and `WEBCACHE_MAX_SIZE_MB` env vars are honored; both default to "off" so behavior is identical for unconfigured users.
- `hook-webfetch-cache.cjs` now logs to stderr on errors when `WEBCACHE_DEBUG=1`. Default off — silent as before.

**Downgrade path:** older versions ignore the new `meta` table. Hit/miss counters reset back to 0 if you actually downgrade and re-upgrade, but cached entries in `cache` table survive.

## v0.1.x → v0.2.0

Adds: `node:test` unit suite, `bench/run.js` benchmark harness. No schema changes, no behavior changes for end users — pure tooling/release-quality work.

## v0.1.4 → v0.1.5

Adds: PostToolUse hook auto-caches every WebFetch. The "call `cached_fetch` first" usage pattern in CLAUDE.md becomes optional.

**Action:** none. The pattern still works for explicit pre-fetch checks.

## v0.1.3 → v0.1.4

Default global TTL changed from 7 days to **unlimited**. To restore the old behavior:

```bash
export WEBCACHE_TTL_DAYS=7
```

## Pre-v0.1.3

The plugin layout was restructured into `./plugin/` subdir for marketplace compatibility. If you cloned the repo before this release, re-clone or `git pull` and reinstall.
