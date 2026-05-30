---
topic: claude-webcache — устарел / уникален?
tier: standard-heavy
date: 2026-05-29
verdict: UNIQUE-NICHE (с критическим блокером дистрибуции)
backends: Brave (focused/critical) + qsearch (broad) + npm/GitHub API + code read
---

# claude-webcache: устарел или уникален? — синтез

## TL;DR

**Вердикт: UNIQUE-NICHE.** У webcache есть один настоящий, узкий, плохо копируемый moat — **прозрачный hook-перехват нативных WebFetch/WebSearch** (Claude продолжает звать стандартные инструменты, кэш невидим). Этого паттерна **не делает ни один из 8+ найденных конкурентов** — все они отдельные MCP-tools, требующие менять workflow.

**Но это не имеет значения для рынка прямо сейчас**, потому что:

> 🔴 **Публично доступна только v0.1.5 — сломанная версия, которая ничего не кэширует** (`${CLAUDE_PLUGIN_ROOT}` silent-fail). v0.4.0 и v0.5.0 (рабочие, с auto-read + WebSearch) **никогда не публиковались в npm** — застряли на шаге `npm publish --otp`. 817 downloads/месяц получают нерабочий плагин.

Вся уникальность v0.5.0 существует **только на твоей машине**. Приоритет инвестиций — не пивот и не новые фичи, а **публикация рабочей версии**.

## Ответы на killer questions

### Q1 — Прямые конкуренты? ДА, ниша плотно занята (8+ инструментов, март–апрель 2026)

| Инструмент | Что делает | Кэш |
|---|---|---|
| **lyshrines/claude-custom-fetch-mcp** (Mar 2026) | local HTTP fetch + extract body (убирает рекламу/навигацию) + API-detection, для Claude Code | **SQLite, 1h TTL, MAX_CACHE_SIZE_MB** |
| **just-every/mcp-read-website-fast** | local fetch + Mozilla Readability + Turndown, "minimal token footprint", для Claude Code/IDE | **smart caching** + robots.txt |
| **nikketryhard/fast-webfetch-mcp** (Mar 2026) | Firecrawl backend + fallback Direct Fetch + Readability + опц. AI summary | через backend |
| **PullMD** (Apr 2026) | self-hosted Docker, url→md, Reddit-aware, "stops burning tokens parsing HTML" | да |
| **Jina Reader MCP** (jSwords91) | r.jina.ai bridge, url→md | automatic content caching + change detection |
| **Firecrawl MCP** | remote/local, url→md/JSON, browser automation | сервисный |
| **zcaceres/fetch-mcp** | fetch в HTML/JSON/text/Markdown/readable | — |
| **SiteMCP** | crawl-once сайт→MCP | `~/.cache/sitemcp` reuse + CI pre-warm |

### Q2 — Built-in кэш перекрывает use-case? НЕТ (это и есть исходный raison d'être webcache)

Встроенный WebFetch-кэш Claude Code (триангулировано: Quercle blog, Mikhail Shilkov, Xiaojian Yu Medium, наш README на mcpmarket):
- **15 минут, by-URL, self-cleaning, in-session only.** НЕ cross-session, НЕ persistent.
- WebFetch фетчит локально через Axios + **вторичная Haiku-сессия суммаризует** контент → подтверждает, что webcache кэширует суммаризацию, а не сырую страницу.
- ⚠️ Не путать с **prompt-cache TTL drama** (1h→5m регрессия, апрель 2026, quota inflation) — это KV-cache, отдельная подсистема. Но она показывает: «кэш в Claude Code» — горячая болезненная тема, вокруг неё активная разработка (см. claude-code-cache-fix, npm v3.6.0, активные contributors).

→ Окно для cross-session web-кэша **реально существует** и Anthropic его не закрыл.

### Q3 — Что у webcache уникально? Ровно одна ось — прозрачность

Поиск `cc_hooks_cache` не нашёл **ни одного** hook-based кэш-перехватчика — только generic hook-доки. Это подтверждает: PreToolUse-hook `deny`-with-content для кэша — редкий/неосвоенный паттерн.

| Свойство | webcache v0.5 | built-in CC | custom-fetch / read-fast / Jina |
|---|:---:|:---:|:---:|
| Cross-session persistent | ✅ | ❌ (15 мин) | ✅ |
| **Прозрачный hook-перехват (0 изменений workflow)** | ✅ **только он** | n/a | ❌ (явный MCP-tool) |
| Кэширует **нативный** WebFetch | ✅ | n/a | ❌ (заменяют своим tool) |
| **WebSearch caching** | ✅ | ❌ | ❌ (в основном) |
| Zero external deps (pure stdlib) | ✅ | n/a | ❌ (Readability/Turndown/Python/API) |
| Сам фетчит сырую страницу → чистый md | ❌ (кэш суммаризации) | n/a | ✅ |
| Reuse между промптами (key=url) | ❌ (key=url+prompt) | n/a | ✅ |
| **Опубликована рабочая версия** | 🔴 ❌ (npm застрял на 0.1.5) | ✅ | ✅ |

**Уникальная комбинация:** прозрачный hook-перехват + WebSearch caching + zero-dep. **Проигрывает** конкурентам по: full-page reuse, self-fetch чистого md, и — критично — публичной рабочей версии.

### Q4 — Full-page пивот уже существует? ДА, и это меняет смысл пивота

Идея «любой fetch → полная страница в md» — это **ровно то, что делают** mcp-read-website-fast, claude-custom-fetch, Firecrawl, Jina. Они фетчат сами + Readability/Turndown. Пивот webcache в эту сторону = **переизобретение зрелого решения**, причём:
- webcache пришлось бы стать фетчером + HTML→md конвертером → **потеря zero-dep moat** (нужен Readability/Turndown или болезненный stdlib-парсинг).
- единственное, что webcache привнёс бы поверх конкурентов — **ту же transparent-hook доставку**. Без неё пивот неконкурентоспособен.

→ Пивот оправдан **только** если сохранить hook-прозрачность (PreToolUse сам фетчит full page по key=url и отдаёт инлайн). Иначе — лучше не лезть в занятую нишу.

### Q5 — Спрос (свежие данные, 2026-05-29)

- npm `@theyahia/claude-webcache`: **817 downloads/last-month, 30/last-week**. Низко.
- **npm latest = 0.1.5** (опубликовано 2026-05-01). Версии 0.1.0–0.1.5 только. **v0.4/v0.5 не на npm.**
- Видимость: индексирован на **mcpmarket.com/server/claude-webcache**, github README ловится SearXNG. В Brave-индексе — 0 упоминаний. → низкая, но не нулевая.
- GitHub stars: 0 (из memory obs 21639; свежий API rate-limited → low-confidence).

→ Спрос низкий, и тот, что есть, утекает в сломанную v0.1.5.

## Disconfirming / steel-man («webcache не нужен»)

1. **«Built-in 15-мин кэша хватает»** — Jarred Sumner (Anthropic): «meaningful share of requests are one-shot, не revisited». Для большинства одноразовых fetch cross-session кэш не нужен. Контр: research-sprint use-case (re-fetch одних и тех же arxiv/docs между сессиями) — реальный, но узкий → согласуется с NICHE.
2. **«Конкуренты технически сильнее»** — да: full-page, Readability, self-fetch, token-efficient. webcache слабее в core механике extract.
3. **«Anthropic закроет gap»** — тренд: server-side `web_fetch_20250910`, `prompt_cache_retention` 24h. Anthropic расширяет кэш-горизонт → риск обнуления.
4. **«Hook-подход хрупок»** — наш же `${CLAUDE_PLUGIN_ROOT}` silent-fail (полгода нулевого кэширования, никто не заметил) доказывает: прозрачность = и moat, и хрупкость (тихие отказы невидимы пользователю).
5. **«Спрос отсутствует»** — 30/week на сломанной версии. Невозможно отличить «нет спроса» от «спрос есть, но продукт сломан и невидим».

## Рекомендация — куда инвестировать (в порядке ROI)

1. 🔴 **Опубликовать рабочую v0.5.0 в npm** (`npm publish --otp`) + bump marketplace/plugin manifests + дождаться, чтобы пользователь подтвердил, что хук пишет кэш (`cache_stats` растёт, `~/.webcache/hook.log` чист). **Без этого пункта остальные бессмысленны** — рынок видит только broken 0.1.5.
2. **Удвоить на единственном moat — transparent hook + WebSearch caching.** Это то, чего нет у конкурентов; позиционировать явно («zero-config, no workflow change, also caches WebSearch»).
3. **Пивот full-page — только в hook-форме** (PreToolUse сам фетчит по key=url, инлайн), и только после п.1. Это снимет проигрыш по reuse, сохранив moat. Но взвесить против потери zero-dep (нужен HTML→md).
4. **Distribution** — техническая уникальность бесполезна при нулевой видимости. После публикации: GitHub release notes, mcpmarket-карточка, Habr-черновик (obs 21639).

**НЕ делать:** слепой пивот в «full-page md» без hook-прозрачности — это вход в занятую нишу против более зрелых инструментов с потерей собственного moat.

## Phase 7 — retrospective / Brier

| Prior | P(true) | Итог | Комментарий |
|---|---|---|---|
| P1 зрелый WebFetch-cache конкурент существует | 0.55 | **TRUE** | Недооценил: их 8+, не 1 |
| P2 built-in кэш только in-session | 0.80 | **TRUE** | Подтверждено 4 источниками |
| P3 Anthropic не анонсировал persistent fetch cache | 0.70 | **TRUE (с риском)** | Но тренд к расширению кэша |
| P4 auto-read hook — редкий/уникальный паттерн | 0.50 | **TRUE** | Сильнее, чем ждал — 0 аналогов |
| P5 готовый full-page-md cache существует | 0.45 | **TRUE** | Недооценил зрелость ниши |
| P6 npm downloads < 100/week | 0.65 | **TRUE** | 30/week |

**Калибровка:** систематически недооценивал зрелость/плотность ниши (P1, P5). Главный сюрприз вне приоров — **публичная версия сломана и не обновлялась** (не был в гипотезах; всплыло только через npm API). Урок: для «уникальность продукта» всегда проверять *что реально опубликовано*, а не состояние локального репо.

**Деградация vs heavy-max floor:** standard-heavy (3 файла, 17 queries, 1 сессия) — не heavy-max (нет 17-20 numbered files, 25+ priors). Соответствует запросу. Disconfirming сделан логически из основного sweep, без отдельного disconfirming-прогона — допустимо для standard-heavy, помечено.
