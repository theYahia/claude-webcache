# Contributing

## Setup

```bash
git clone https://github.com/theYahia/claude-webcache.git
cd claude-webcache
npm install
```

Requires Node.js 22.5+ (uses built-in `node:sqlite`).

## Local plugin install

To test the full plugin flow in Claude Code, install from your local clone:

```
/plugin install file:///absolute/path/to/claude-webcache
```

Restart the session, then run `/mcp` — you should see `claude-webcache` listed.

## Testing

Run the manual E2E checklist in [E2E_TEST.md](E2E_TEST.md). It covers:
- CACHE_MISS flow (first session)
- CACHE_HIT flow (second session)
- SessionStart hook stats line

There are no automated unit tests yet (the core is ~200 lines; the MCP layer is thin). A passing `npm publish --dry-run` is the CI smoke test.

## Opening a PR

1. Fork the repo and create a branch from `main`.
2. Make your change.
3. Verify `npm publish --dry-run` passes locally.
4. Open a PR — describe what and why.
