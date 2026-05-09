# claude-webcache

![npm](https://img.shields.io/npm/v/@theyahia/claude-webcache.svg)
![npm downloads](https://img.shields.io/npm/dm/@theyahia/claude-webcache.svg)
![license](https://img.shields.io/npm/l/@theyahia/claude-webcache.svg)
![tests](https://github.com/theYahia/claude-webcache/actions/workflows/test.yml/badge.svg)

**Persistent cross-session WebFetch cache for Claude Code. Cached reads in ~0.05ms — orders of magnitude faster than re-fetching.**

Claude Code's built-in cache lasts 15 minutes, within one session. Every new session re-fetches from scratch. `claude-webcache` persists results across sessions in a local SQLite database — instant cache hits, zero network cost.

```
Session 1  →  WebFetch("docs.example.com")  →  fetched, auto-cached ✓
Session 2  →  cached_fetch("docs.example.com")  →  instant hit, no network call
Session 7  →  cached_fetch("docs.example.com")  →  still instant, unlimited TTL
```

**v0.1.5+:** every `WebFetch` is automatically saved via `PostToolUse` hook — nothing to configure.

![CACHE_MISS flow: WebFetch + cache_store in first session](docs/screenshots/cache-miss.png)
![CACHE_HIT flow: instant hit, no WebFetch in second session](docs/screenshots/cache-hit.png)

## Install

```bash
claude plugin marketplace add theYahia/claude-webcache && claude plugin install claude-webcache@theyahia
```

Works in: **Claude Code CLI · Desktop (Mac/Windows) · VS Code extension · JetBrains plugin** — same command everywhere.

Done. Every `WebFetch` is auto-cached from now on.

Optionally add the [usage pattern](#usage-pattern) to `~/.claude/CLAUDE.md` to also check the cache *before* fetching (saves the WebFetch call entirely on repeat URLs).

> **Plugin TUI not working?** There's an open Claude Code bug ([#41653](https://github.com/anthropics/claude-code/issues/41653)) where `/plugin install` rejects third-party sources with "source type not supported." Use the CLI command above — it bypasses the TUI and works fine.
>
> **Fallback (no marketplace):**
> ```bash
> git clone https://github.com/theYahia/claude-webcache && claude --plugin-dir ./claude-webcache/plugin
> ```

### Option 2 — npm global

```bash
npm i -g @theyahia/claude-webcache
```

Requires Node.js **22.5+** (uses built-in `node:sqlite` — no native deps, no install step).

Then register in `~/.claude/settings.json` (replace path with output of `npm root -g`):

```json
{
  "mcpServers": {
    "claude-webcache": {
      "command": "node",
      "args": ["/path/from/npm-root-g/claude-webcache/scripts/mcp-server.cjs"]
    }
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          { "type": "command", "command": "node /path/from/npm-root-g/claude-webcache/scripts/hook-stats.cjs" }
        ]
      }
    ]
  }
}
```

### Option 3 — clone (contributors)

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Usage pattern (optional — for pre-fetch cache checks)

**v0.1.5+ auto-caches every WebFetch automatically.** The pattern below is optional: add it to `~/.claude/CLAUDE.md` to also check the cache *before* making a WebFetch — this saves the WebFetch call entirely on repeat URLs.

```markdown
## WebFetch caching (claude-webcache)

Before calling WebFetch, call `cached_fetch(url, prompt)` first.
- If it returns text → use that, do NOT call WebFetch.
- If it returns `[CACHE_MISS] <url>` → call WebFetch as normal (it will be auto-cached for next time).
```

Same URL + same prompt in any future session = instant hit, zero network cost.

## Tools (MCP)

| Tool | Args | Returns |
|---|---|---|
| `cached_fetch` | `url`, `prompt` | cached text, or `[CACHE_MISS] <url>` |
| `cache_store` | `url`, `prompt`, `output` | `stored` |
| `cache_stats` | — | `{ total, hits, misses, hit_rate, last, db_size_bytes, evicted, top_urls }` |
| `cache_list` | `limit?` | recent URLs (most recent first) |
| `cache_invalidate` | `url` | `{ deleted: N }` — drops every entry for that URL |
| `cache_clear` | `older_than_days?`, `confirm?` | `{ deleted: N }` — partial wipe by age, or full wipe with `confirm:"YES"` |

## CLI

The npm package ships a `claude-webcache` binary for ad-hoc inspection and a local web dashboard:

```bash
claude-webcache stats                            # JSON stats
claude-webcache list 20                          # 20 most-recent URLs
claude-webcache invalidate https://news.com/123  # drop one URL
claude-webcache clear --older-than-days 30       # partial wipe
claude-webcache clear --confirm YES              # full wipe (requires explicit confirm)
claude-webcache dashboard                        # open http://localhost:37778
claude-webcache dashboard --port 8080            # custom port
```

The dashboard renders top URLs by hits, top domains, full search-able list with one-click invalidate buttons. Pure stdlib — no extra deps to install.

## Configuration (env vars)

| Variable | Default | Effect |
|---|---|---|
| `WEBCACHE_TTL_DAYS` | unlimited | Global TTL in days. `0` or unset = unlimited. |
| `WEBCACHE_MAX_SIZE_MB` | unlimited | Above this size, LRU eviction drops ~20% of oldest-by-`last_hit_at` entries on next write (debounced every 100 writes). |
| `WEBCACHE_DOMAIN_TTL` | none | Per-domain TTL JSON: `{"news.com":1,"reuters.com":1,"arxiv.org":0}`. Days; `0` = unlimited. Suffix-matches subdomains. Overrides global TTL when matched. |
| `WEBCACHE_DEBUG` | off | `1` enables stderr trace from the auto-cache hook on errors. |

## SessionStart hook

Every new session injects a one-liner so Claude knows the cache exists:

```
webcache: 142 pages cached, 38 hits, last fetch 3h ago
```

No output if cache is empty.

## Storage

SQLite at `~/.webcache/cache.db` (WAL mode, concurrent-safe).  
Cache key = `SHA256(url + "|" + prompt)`. Default TTL: **unlimited** (set `WEBCACHE_TTL_DAYS=N` for N-day expiry).

| Field | Type |
|---|---|
| `key` | TEXT PRIMARY KEY |
| `url` | TEXT |
| `prompt_hash` | TEXT |
| `output` | TEXT |
| `cached_at` | INTEGER (ms epoch) |
| `hit_count` | INTEGER |
| `last_hit_at` | INTEGER |

## Limits

- Cache key includes the prompt — use consistent prompts to maximize hit rate.
- Output is whatever WebFetch returns (already summarized). No re-processing.
- No semantic search. Exact `(url, prompt)` match only.

## Benchmarks

Single-process latency on a populated DB (N=10000 entries, 1KB output each), measured via `npm run bench` on AMD Ryzen 9 3900X / Node 24:

| Op | p50 | p95 | p99 | ops/sec |
|---|---:|---:|---:|---:|
| `read_hit` | 0.10ms | 0.19ms | 0.51ms | 5,200 |
| `read_miss` | 0.05ms | 0.13ms | 0.34ms | 10,900 |
| `write` | 0.07ms | 0.16ms | 1.85ms | 6,400 |
| `list(50)` | 0.15ms | 0.38ms | 1.47ms | 4,500 |

Storage overhead: ~1.9 KB per entry for a 1 KB payload (extra ≈ key + indexes + WAL).

WebFetch over the network typically takes 1-5 seconds — a cached hit is **~20,000-100,000× faster**. Reproduce on your hardware: `npm run bench`. See [`bench/README.md`](bench/README.md) for methodology and full results metadata (CPU, RAM, OS, commit) saved per run.

## Related

- [claude-mem](https://github.com/thedotmack/claude-mem) — persistent memory across sessions (complements claude-webcache: memory vs. web cache)
- [WWmcp](https://github.com/theYahia/WWmcp) — catalog of 120+ MCP servers for non-Western APIs

## License

MIT — see [LICENSE](LICENSE).
