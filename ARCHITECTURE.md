# Architecture

One-page map of how `claude-webcache` is wired. Lives in ~300 lines of JS across four scripts plus a SQLite file.

## Components

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Claude Code session                                │
│                                                                           │
│   user prompt ─→ assistant ─→ WebFetch(url, prompt) ─→ live HTTP fetch    │
│                       │                  │                                │
│                       │                  │ PostToolUse hook fires         │
│                       │                  ▼                                │
│                       │          hook-webfetch-cache.cjs                  │
│                       │          (auto-write to cache)                    │
│                       │                  │                                │
│                       ▼                  │                                │
│                 cached_fetch  ───────────┼──→ MCP stdio JSON-RPC          │
│                 cache_*        ─────────┐│                                │
│                                         ▼▼                                │
│                                   mcp-server.cjs                          │
│                                   (5 tools registered)                    │
│                                         │                                 │
└─────────────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                                   plugin/src/cache.js
                                   (DatabaseSync, WAL)
                                          │
                                          ▼
                                ~/.webcache/cache.db
                                   (SQLite, 2 tables)
```

The dashboard (`scripts/dashboard.cjs`) is launched separately by the user via the `claude-webcache` CLI binary (`scripts/cli.cjs`). It opens its own HTTP server on `:37778` against the same SQLite file. It is **not** loaded inside the MCP server — keeping the MCP plugin stdio-pure.

## Files

| File | Role |
|---|---|
| `plugin/src/cache.js` | Core SQLite layer — `get`/`set`/`stats`/`list`/`invalidate`/`clear`/`evictIfNeeded`/`purgeExpired`. Pure logic, no I/O outside SQLite + fs.statSync. |
| `plugin/scripts/mcp-server.cjs` | Stdio MCP server. Registers 6 tools, dispatches to `cache.js`. |
| `plugin/scripts/hook-webfetch-cache.cjs` | PostToolUse hook. Reads JSON from stdin, calls `cache.set` if `tool_name === 'WebFetch'`. |
| `plugin/scripts/hook-stats.cjs` | SessionStart hook. Prints one-line cache stats greeting. |
| `plugin/scripts/cli.cjs` | `claude-webcache` CLI binary — `stats`, `list`, `invalidate`, `clear`, `dashboard`. |
| `plugin/scripts/dashboard.cjs` | Local HTTP dashboard launched by `cli.cjs dashboard`. |
| `plugin/.claude-plugin/plugin.json` | Plugin manifest, source of truth for the version string at runtime. |
| `plugin/hooks/hooks.json` | Hook registration: `SessionStart` + `PostToolUse:WebFetch`. |
| `plugin/.mcp.json` | MCP server registration (relative path: `./scripts/mcp-server.cjs`). |

## Schema

```sql
CREATE TABLE cache (
  key         TEXT PRIMARY KEY,         -- SHA256(trim(url) + '|' + trim(prompt))
  url         TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,            -- 16-char prefix of SHA256(prompt), kept for debugging
  output      TEXT NOT NULL,
  cached_at   INTEGER NOT NULL,         -- ms epoch
  hit_count   INTEGER NOT NULL DEFAULT 0,
  last_hit_at INTEGER                   -- ms epoch, NULL until first hit
);
CREATE INDEX idx_cached_at   ON cache(cached_at);
CREATE INDEX idx_url         ON cache(url);
CREATE INDEX idx_last_hit_at ON cache(last_hit_at);

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,               -- 'miss_count', 'evict_count'
  value INTEGER NOT NULL DEFAULT 0
);
```

PRAGMAs at open: `journal_mode = WAL`, `synchronous = NORMAL`. WAL gives crash-safe writes without `synchronous = FULL` overhead — fits our cache use case where losing the last few writes after a crash is acceptable.

## Data flow

**Write (auto-cache):**
1. Claude calls `WebFetch(url, prompt)`.
2. Claude Code runtime returns the response and fires PostToolUse hooks.
3. `hook-webfetch-cache.cjs` reads `{ tool_name, tool_input, tool_response }` from stdin.
4. If `tool_name === 'WebFetch'`, extract URL/prompt/output and call `cache.set()`.
5. `cache.set()` upserts into the `cache` table. Every 100 writes it calls `evictIfNeeded()` if `WEBCACHE_MAX_SIZE_MB` is set.

**Read (explicit pre-fetch check):**
1. Claude calls `cached_fetch(url, prompt)` MCP tool.
2. `mcp-server.cjs` calls `cache.get(url, prompt)`.
3. `cache.get()` looks up the SHA256 key, checks effective TTL (per-domain override > global), increments `hit_count`/`last_hit_at` on hit, increments `miss_count` in `meta` on miss.
4. Returns cached output, or `[CACHE_MISS] <url>` for the assistant to handle (it then calls real WebFetch, which fires the auto-cache hook).

**Eviction (size cap):**
1. Triggered by `cache.set()` every 100 writes (debounced) or by manual `cache.evictIfNeeded()` call.
2. If `fs.statSync(DB_PATH).size > MAX_SIZE_BYTES`, deletes oldest-by-`last_hit_at` rows (`COALESCE(last_hit_at, cached_at)` for never-hit rows).
3. Drop count: `max(1, min(total - 1, ceil(total * 0.20)))` — never wipes the entire cache via auto-eviction.
4. Runs `VACUUM` after to actually shrink the file on disk.

## Configuration

All knobs are env vars, read once at `cache.js` module load. See README for the full table. The two non-obvious ones:

- **`WEBCACHE_DOMAIN_TTL`** — per-domain override JSON. Resolution order on `cache.get()`: exact host match → suffix match (`*.example.com` matches `api.example.com`) → fallback to global `WEBCACHE_TTL_DAYS`.
- **`WEBCACHE_MAX_SIZE_MB`** — soft cap. Eviction is debounced (every 100 writes) so the file may briefly exceed the cap between checks.

## Testing

`plugin/test/cache.test.js` — Node native test runner, 17 tests, ~830ms total. Each test runs in an isolated temp dir via `freshCache()` helper which monkey-patches `os.homedir()` and forces a fresh `require()` of `cache.js`. Coverage: `makeKey` determinism, round-trip set/get, hit_count/last_hit_at increment, TTL expiry, upsert behavior, `purgeExpired`, rich `stats()` shape, miss tracking, `invalidate`, `clear` (full + partial), domain TTL exact/suffix matching, eviction LRU correctness.

Performance regression detection: `bench/run.js` produces JSON results with full machine metadata. Compare against `bench/baselines/2026-05-01-pre-hw-swap.json` after any change touching `cache.js`.

## Non-goals (explicit)

- **Not a content-aware cache.** Doesn't parse HTML/JSON, doesn't dedupe across paraphrased prompts. Cache key is byte-equivalent `(url, prompt)`.
- **Not HTTP-spec-aware.** Doesn't read `Cache-Control`/`ETag`/`Last-Modified` from responses (the WebFetch hook payload doesn't expose them). Use `WEBCACHE_DOMAIN_TTL` to express "this domain is volatile" intent.
- **Not multi-machine.** Single SQLite file in `~/.webcache/`. Multi-machine team caches via Redis/Postgres are deferred to a future major version.
- **Not vary-by-header.** Same upstream limitation as Cache-Control. Prompts are the only differentiator.
