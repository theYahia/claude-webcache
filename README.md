# claude-webcache

**Cross-session WebFetch cache for Claude Code.**

Claude Code's built-in `WebFetch` caches results for 15 minutes within a single session. `claude-webcache` extends that across sessions, indefinitely (TTL 7 days, configurable).

```
Open new session  →  your past fetches are still there.
Cache hit         →  instant.
Cache miss        →  same as built-in WebFetch.
```

## Why

If you do research sprints in Claude Code, you re-fetch the same docs across sessions all the time. The 15-minute in-session cache evicts before your next sprint. `claude-webcache` keeps fetches around so the second sprint hits cache.

## Install

```bash
npm install -g @theyahia/claude-webcache
```

Or clone and install locally:

```bash
git clone https://github.com/theYahia/claude-webcache.git
cd claude-webcache
npm install
```

Then register the MCP server and hook by adding to your `~/.claude/settings.json` (or project `.mcp.json` + `hooks/hooks.json`):

```json
{
  "mcpServers": {
    "claude-webcache": {
      "command": "node",
      "args": ["/absolute/path/to/claude-webcache/scripts/mcp-server.cjs"]
    }
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          { "type": "command", "command": "node /absolute/path/to/claude-webcache/scripts/hook-stats.cjs" }
        ]
      }
    ]
  }
}
```

## Usage pattern

Add to your `~/.claude/CLAUDE.md` so Claude routes web fetches through the cache:

```markdown
## WebFetch caching (claude-webcache)

Before calling WebFetch, call `cached_fetch(url, prompt)` first.
- If it returns text → use that, do NOT call WebFetch.
- If it returns `[CACHE_MISS] <url>` → call WebFetch as normal, then call `cache_store(url, prompt, output)` with the result.
```

That's it. Same URL + same prompt in any future session = instant cache hit.

## Tools (MCP)

| Tool | Args | Returns |
|---|---|---|
| `cached_fetch` | `url`, `prompt` | cached text, or `[CACHE_MISS] <url>` |
| `cache_store` | `url`, `prompt`, `output` | `stored` |
| `cache_stats` | — | `{ total, hits, last }` |
| `cache_list` | `limit?` | recent URLs (most recent first) |

## Storage

SQLite at `~/.webcache/cache.db` (WAL mode, concurrent-safe). Cache key = `SHA256(url + "|" + prompt)`.

| Field | Type |
|---|---|
| `key` | TEXT PRIMARY KEY |
| `url` | TEXT |
| `prompt_hash` | TEXT |
| `output` | TEXT |
| `cached_at` | INTEGER (ms epoch) |
| `hit_count` | INTEGER |
| `last_hit_at` | INTEGER |

## SessionStart hook

On every new session, the hook injects a one-line stat:

```
webcache: 142 pages cached, 38 hits, last fetch 3h ago
```

Skip injection if cache is empty.

## TTL

Default 7 days. Expired entries are deleted on next read of the same key. Run a manual purge by requiring `src/cache.js` and calling `purgeExpired()`.

## Limits

- Cache key includes the prompt → different prompts on the same URL are separate entries. Pick consistent prompts (e.g. always "extract title and main content") to maximize hit rate.
- Output is whatever WebFetch returns (already summarized by the model). The cache doesn't re-process it.
- No semantic search, no embeddings. Exact `(url, prompt)` match only.

## License

MIT — see [LICENSE](LICENSE).
