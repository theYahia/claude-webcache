---
topic: claude-webcache — устарел / уникален?
tier: standard-heavy
date: 2026-05-29
blocking_decision: "Уникальность → куда инвестировать (webcache держим)"
gut_prior: "40% что core webcache уже не уникален (built-in кэш + зрелые MCP конкуренты перекрывают)"
time_cap: "single session"
---

# Brief: устарел / уникален ли claude-webcache?

## Decision this unblocks

webcache **держим** (решено пользователем). Research отвечает: **что из фич реально уникально vs конкуренты, куда инвестировать**. Побочно — валиден ли full-page-md пивот или это уже готовый инструмент.

## Killer questions

1. **Прямые конкуренты** — есть ли Claude Code плагины / MCP-серверы, persistently кэширующие WebFetch/WebSearch cross-session? (npm, GitHub, awesome-claude-code, MCP registry, Glama, Smithery)
2. **Built-in перекрытие** — покрывает ли встроенный 15-мин кэш Claude Code наш use-case? Анонсировал ли Anthropic persistent fetch cache?
3. **Архитектурная уникальность** — что из {SQLite cross-session, namespace isolation, domain TTL, gzip, auto-read PreToolUse hooks, WebSearch caching, eviction, CLI dashboard} есть у конкурентов, чего нет? Где дельта?
4. **Full-page пивот уже существует?** — Jina Reader, firecrawl, pure-md, reader MCP. Если пивот = переизобретение готового — меняет вердикт.
5. **Спрос** — npm downloads тренд `@theyahia/claude-webcache` (verify свежим API, не цитировать «309/week»), GitHub stars наш vs конкурентов.
6. **Moat** — защищаемое value prop, или commodity-фича, которую Anthropic закроет апдейтом?

## Decision criteria (вердикт)

- **UNIQUE-STRONG** — core (persistent cross-session кэш via hooks + авто-read) не покрыт ни built-in, ни конкурентами → инвестировать в дифференциаторы.
- **UNIQUE-NICHE** — частично покрыто, есть незанятая ниша → узкий дифференциатор, не расширять.
- **NOT-UNIQUE / COMMODITY** — покрыто built-in/зрелыми конкурентами → минимальная поддержка, не инвестировать.

## What I Already Know

- **Архитектура (из кода):** ключ `SHA256(namespace|canonical_url|prompt)` — prompt-specific; хранит суммаризацию WebFetch (`tool_response.content[].text`), не сырую страницу. WebFetch не отдаёт хуку полную страницу.
- v0.5.0, 61/61 тестов, auto-read + WebSearch caching (commit 244d8c9, релиз 2026-05-21).
- Distribution слабая: GitHub 0 stars, Glama не индексирован, Habr-черновик не опубликован (obs 21639).
- npm downloads спад, «309/week» устарело (obs 21636) → **verify свежим npm API**.
- Pure-stdlib правило (без npm deps) — важно для feasibility full-page пивота.

## Prior beliefs (Brier calibration)

| # | Утверждение | Prior P(true) |
|---|---|---|
| P1 | Существует ≥1 зрелый MCP/плагин, кэширующий WebFetch cross-session | 0.55 |
| P2 | Built-in кэш Claude Code — только in-session (≤15 мин), не cross-session | 0.80 |
| P3 | Anthropic НЕ анонсировал persistent fetch cache | 0.70 |
| P4 | Auto-read PreToolUse hook (deny-with-content) — редкий/уникальный паттерн | 0.50 |
| P5 | Готовый persistent full-page-md cache для Claude Code уже существует | 0.45 |
| P6 | npm downloads webcache < 100/week (low adoption) | 0.65 |

## Pre-mortem (как research проваливается)

- **FM1** — landscape по «cache» зашумлён prompt-caching (Anthropic API feature) vs content-caching. Митигировать: явно разделять в queries.
- **FM2** — «конкуренты» найдутся, но окажутся abandoned/0-star → ложный NOT-UNIQUE. Митигировать: проверять активность (last commit, downloads).
- **FM3** — npm/GitHub метрики stale → неверный спрос. Митигировать: свежий API в Phase 4.

## Brave Sweep Plan

`queries.txt` (17 кластеров, priority routing): ~10 broad → qsearch, 5 focused → Brave, 2 critical → Brave+Context. Country=us, lang=en (англоязычная техническая тема).
