# claude-webcache

![npm](https://img.shields.io/npm/v/@theyahia/claude-webcache.svg)
![npm downloads](https://img.shields.io/npm/dm/@theyahia/claude-webcache.svg)
![license](https://img.shields.io/npm/l/@theyahia/claude-webcache.svg)

**Persistent cross-session WebFetch cache for Claude Code. 5-15× fewer WebFetch calls on repeated URLs.**

Claude Code's built-in cache lasts 15 minutes, within one session. Every new session re-fetches from scratch. `claude-webcache` persists results across sessions in a local SQLite database — instant cache hits, zero network cost.

```
Session 1  →  WebFetch("docs.example.com")  →  fetched, stored
Session 2  →  cached_fetch("docs.example.com")  →  instant hit, no network call
Session 7  →  cached_fetch("docs.example.com")  →  still instant, 7-day TTL
```

![CACHE_MISS flow: WebFetch + cache_store in first session](docs/screenshots/cache-miss.png)
![CACHE_HIT flow: instant hit, no WebFetch in second session](docs/screenshots/cache-hit.png)

## Install

```bash
claude plugin marketplace add theYahia/claude-webcache && claude plugin install claude-webcache@theyahia
```

Works in: **Claude Code CLI · Desktop (Mac/Windows) · VS Code extension · JetBrains plugin** — same command everywhere.

Then add the [usage pattern](#usage-pattern) to `~/.claude/CLAUDE.md` (20 seconds).

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

## Usage pattern

Add this to `~/.claude/CLAUDE.md`:

```markdown
## WebFetch caching (claude-webcache)

Before calling WebFetch, call `cached_fetch(url, prompt)` first.
- If it returns text → use that, do NOT call WebFetch.
- If it returns `[CACHE_MISS] <url>` → call WebFetch as normal, then call `cache_store(url, prompt, output)` with the result.
```

That's it. Same URL + same prompt in any future session = instant hit.

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
Cache key = `SHA256(url + "|" + prompt)`. Default TTL: 7 days (configurable).

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

## Related

- [claude-mem](https://github.com/thedotmack/claude-mem) — persistent memory across sessions (complements claude-webcache: memory vs. web cache)
- [WWmcp](https://github.com/theYahia/WWmcp) — catalog of 120+ MCP servers for non-Western APIs

## License

MIT — see [LICENSE](LICENSE).
