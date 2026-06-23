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

## Federation (multi-instance)

**Opt-in, off by default.** Federation lets several webcache instances (e.g. a laptop and a
workstation, or several teammates on a LAN) share cache hits without a central server or any new
dependency. It closes the long-deferred *"Not multi-machine"* non-goal — as an MVP, not a full
distributed cache.

**How it works.** Each instance can run a small read-only HTTP server (`claude-webcache federation`)
in its **own process** — deliberately separate from the stdio MCP server, which stays stdio-pure. On
a `cached_fetch` **local + qsearch miss**, an instance configured with `WEBCACHE_PEERS` queries each
peer's `GET /federation/get?ns=&key=` in order. On the first hit it **writes the result into its own
local cache** and returns it. Lookups use the shared key
`SHA256(namespace + '|' + canonical_url + '|' + prompt)`, computed identically on every instance — so
a page cached on instance A is found by instance B even if B spells the URL differently (case, port,
query-param order, fragment are all canonicalized away).

**Fail-open, always.** Any peer being down, slow, returning garbage, or rejecting your token is
indistinguishable from "no peers configured": the lookup returns nothing and your fetch proceeds
normally. A per-peer timeout (default 2s) bounds the wait. Federation never throws and never blocks.

### Setup

On the instance that will **serve** its cache (instance A):

```bash
# loopback-only (same machine, e.g. two Claude Code installs): no token needed
claude-webcache federation                       # binds 127.0.0.1:37779

# expose to other machines: bind all interfaces AND require a shared secret
WEBCACHE_FEDERATION_HOST=0.0.0.0 \
WEBCACHE_FEDERATION_TOKEN=$(openssl rand -hex 16) \
claude-webcache federation
```

On the instance that will **consume** peers (instance B), point it at A and (if A set one) supply the
token — both as env vars in B's Claude Code environment:

```bash
WEBCACHE_PEERS="http://A-host:37779"
WEBCACHE_FEDERATION_TOKEN="<same secret as A>"     # only if A is token-protected
```

Check connectivity any time:

```bash
claude-webcache federation-status                  # health-checks WEBCACHE_PEERS
```

Inside a session, the `cache_federation_stats` MCP tool reports the peer list, this session's
federated hit/miss counts, the last peer that served a hit, and per-peer health.

### Endpoints (read-only)

| Route | Returns |
|------|---------|
| `GET /federation/get?ns=<namespace>&key=<sha256>` | `200 {output}` on hit, `404` on miss |
| `GET /federation/health` | `200 {ok, entries}` |

Both require a matching `X-Federation-Token` header **iff** `WEBCACHE_FEDERATION_TOKEN` is set
(timing-safe compare), otherwise `401`. The server only answers `GET`; anything else is `405`.

> **Security.** The federated cache may contain fetched page content. Federation binds **loopback by
> default** for that reason. To cross machines, set `WEBCACHE_FEDERATION_HOST=0.0.0.0`, set a
> `WEBCACHE_FEDERATION_TOKEN`, and firewall the port to trusted hosts. The token is a bearer secret —
> don't commit it. `node:sqlite` (Node ≥ 22) backs the local store; on older runtimes federation
> simply fails open to empty.

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
| `WEBCACHE_NAMESPACE` | `""` | isolates the local/federation cache per project (must match across peers to share) |
| `WEBCACHE_PEERS` | unset | comma-separated peer base URLs to query on a local miss (enables federation) |
| `WEBCACHE_FEDERATION_HOST` | `127.0.0.1` | bind host for the federation server (`0.0.0.0` to expose off-box — set a token!) |
| `WEBCACHE_FEDERATION_PORT` | `37779` | bind port for the federation server |
| `WEBCACHE_FEDERATION_TOKEN` | unset | shared secret; if set, peers must send a matching `X-Federation-Token` header |
| `WEBCACHE_FEDERATION_TIMEOUT_MS` | `2000` | per-peer request timeout before that peer is skipped (fail-open) |

## MCP tools (manual; hooks do this automatically)

| Tool | Args | Returns |
|------|------|---------|
| `cached_fetch` | `url` | full-page markdown via `/url_content`, or `[CACHE_MISS] <url>`. On a local+qsearch miss, falls back to federated peers (if `WEBCACHE_PEERS` set) and pulls a peer hit into the local cache |
| `cached_search` | `query` | cached results via `/cache_lookup`, or `[CACHE_MISS] <query>` |
| `cache_stats` | — | qsearch backend status (`up`, corpus total, search hit rate) |
| `cache_federation_stats` | — | federation config + this session's hit/miss counts + per-peer health (empty peers ⇒ disabled) |

## qsearch side

webcache depends on one qsearch endpoint, `POST /url_content { url, max_age_days? }`
(`qsearch/src/server.js`), which does corpus-first exact-URL lookup then fetch+extract+index on
miss. WebSearch reuses the existing `/cache_lookup` + `/cache_store`.
