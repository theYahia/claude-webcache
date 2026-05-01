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
| `cache_stats` | — | `{ total, hits, last }` |
| `cache_list` | `limit?` | recent URLs (most recent first) |

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

Single-process latency on a populated DB (N=10000 entries, 1KB output each), measured via `npm run bench`:

| Op | p50 | p95 | p99 | ops/sec |
|---|---:|---:|---:|---:|
| `read_hit` | 0.05ms | 0.08ms | 0.13ms | 12,300 |
| `read_miss` | 0.01ms | 0.03ms | 0.05ms | 69,700 |
| `write` | 0.06ms | 0.12ms | 1.30ms | 8,100 |
| `list(50)` | 0.08ms | 0.13ms | 0.40ms | 10,600 |

Storage overhead: ~1.9 KB per entry for a 1 KB payload (extra ≈ key + indexes + WAL).

WebFetch over the network typically takes 1-5 seconds — a cached hit is **~20,000-100,000× faster**. Reproduce on your hardware: `npm run bench`. See [`bench/README.md`](bench/README.md) for methodology and full results metadata (CPU, RAM, OS, commit) saved per run.

## How this differs from Anthropic prompt caching

Anthropic's [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) caches prompt-prefix tokens server-side with a 5-minute (or 1-hour) TTL. `claude-webcache` caches WebFetch tool outputs locally in SQLite with no expiry by default. Different layers — they compose, not compete:

| | Anthropic prompt cache | claude-webcache |
|---|---|---|
| What's cached | Input prompt tokens (tools + system + messages prefix) | WebFetch output text |
| Where it lives | Anthropic servers | Local `~/.webcache/cache.db` |
| Lifetime | 5 minutes (or 1 hour) | Unlimited by default |
| Cross-session | No — resets ~hourly at most | Yes — survives restarts, survives weeks |
| Triggers on | Same prompt prefix repeats within TTL | Same `(url, prompt)` ever repeats |
| What it saves | LLM input token billing (cache reads = 0.1× base price) | The WebFetch network round-trip itself |

A cached WebFetch hit returns the exact same bytes every time. Those bytes can then participate in Anthropic's prompt cache normally on the next API call within the same session — the two caches stack: webcache skips the fetch entirely, Anthropic's cache discounts the read of the resulting `tool_result` block.

For Claude Code subscription users (flat-rate, not metered per token), Anthropic prompt caching is mostly invisible to your bill — but `claude-webcache` still saves real wall-clock time and message-turn budget by avoiding the WebFetch round-trip and the inference round needed to summarize the page.

## Related

- [claude-mem](https://github.com/thedotmack/claude-mem) — persistent memory across sessions (complements claude-webcache: memory vs. web cache)
- [WWmcp](https://github.com/theYahia/WWmcp) — catalog of 120+ MCP servers for non-Western APIs

## License

MIT — see [LICENSE](LICENSE).
