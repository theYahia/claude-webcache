# claude-webcache

**A qsearch companion for Claude Code.** Hooks that transparently intercept native
`WebFetch`/`WebSearch` and serve them from a running [qsearch](https://github.com/) instance —
url-keyed full-page cache + query cache, persistent across sessions, growing your research corpus
as a side effect.

> **Not published to npm.** As of v0.6.0 claude-webcache is a personal companion to qsearch, not a
> standalone product. Earlier npm releases (≤0.1.5) were a self-contained SQLite cache and are
> superseded — see [CHANGELOG](CHANGELOG.md). Historical design docs (`ARCHITECTURE.md`,
> `MIGRATION.md`, `REVIEW-*.md`) describe the retired SQLite architecture.

## Why

Claude Code's built-in WebFetch cache is **15 minutes, in-session, by URL** — it evicts before your
next research sprint. qsearch already persistently stores fetched web content (Meilisearch + Qdrant)
and has a query cache. What it lacked was a way to sit on Claude Code's *native* WebFetch/WebSearch.
That's all webcache is now: the hook layer.

Bonus: every ordinary WebFetch you do passively enriches the qsearch corpus, so the `ultra-broad`
tier finds it later for free.

## How it works

| Hook | Event | Action |
|------|-------|--------|
| `hook-webfetch-precache.cjs` | `PreToolUse:WebFetch` | `POST {QSEARCH_URL}/url_content {url}` → on hit/fetch, `deny` with full-page markdown inlined (Claude uses it, skips network). qsearch fetches+caches+indexes on miss. |
| `hook-websearch-precache.cjs` | `PreToolUse:WebSearch` | `GET /cache_lookup?query=` → on hit, `deny` with cached results. |
| `hook-websearch-cache.cjs` | `PostToolUse:WebSearch` | `POST /cache_store` — native WebSearch runs server-side at Anthropic, so we capture its result here for reuse. |
| `hook-stats.cjs` | `SessionStart` | One-line backend status (corpus size, search hit rate). |

**Fail-open by design:** if qsearch is unreachable, every hook emits nothing → the native tool runs
unimpeded. webcache never breaks your session.

The url cache is keyed by **URL alone** (not url+prompt), so the same page is reused across different
prompts and sessions. Full-page markdown comes from qsearch's `fetchHtml` + `extractMainContent`
(Readability-class), not from WebFetch's prompt-specific summary.

## Requirements

- A running **qsearch** instance (default `http://localhost:8080`).
- Claude Code with plugin/hook support; Node ≥ 20 (for global `fetch`).

## Install (local / marketplace)

```
claude plugin marketplace add theYahia/claude-webcache
claude plugin install claude-webcache@theyahia
# restart the Claude Code session — hooks + .mcp.json load at startup
```

## Configuration (env)

| Var | Default | Meaning |
|-----|---------|---------|
| `QSEARCH_URL` | `http://localhost:8080` | qsearch base URL the hooks talk to |
| `WEBCACHE_AUTOREAD` | on | set `0` to disable auto-read (PostToolUse store still runs) |
| `WEBCACHE_QSEARCH_TIMEOUT_MS` | `8000` | per-request timeout before fail-open |
| `WEBCACHE_DEBUG` | off | `1` → debug lines on stderr |
| `WEBCACHE_QUIET` | off | `1` → suppress error lines on stderr (still logged to `~/.webcache/hook.log`) |

## MCP tools (manual; hooks do this automatically)

| Tool | Args | Returns |
|------|------|---------|
| `cached_fetch` | `url` | full-page markdown via `/url_content`, or `[CACHE_MISS] <url>` |
| `cached_search` | `query` | cached results via `/cache_lookup`, or `[CACHE_MISS] <query>` |
| `cache_stats` | — | qsearch backend status (`up`, corpus total, search hit rate) |

## qsearch side

webcache depends on one qsearch endpoint, `POST /url_content { url, max_age_days? }`
(`qsearch/src/server.js`), which does corpus-first exact-URL lookup then fetch+extract+index on
miss. WebSearch reuses the existing `/cache_lookup` + `/cache_store`.
