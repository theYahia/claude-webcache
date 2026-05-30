# Brave sweep — 7 queries

**Config:** country=us, lang=en, extra_snippets=on
**Endpoints used:** web
**Generated:** 2026-05-29T18:36:45Z | **Script:** brave_sweep.py v2

---

## ⚠️ Silent behavior warnings

- [persistent full page markdown cache MCP ]: 1 JSON-serialized snippets
- [firecrawl pure-md html to markdown for L]: 2 JSON-serialized snippets
- [firecrawl pure-md html to markdown for L]: 1 JSON-serialized snippets
- [npm package claude code web fetch cache ]: 1 JSON-serialized snippets
- [npm package claude code web fetch cache ]: 1 JSON-serialized snippets


## anthropic_webfetch_cache — "Anthropic Claude Code WebFetch built-in cache 15 minute behavior"

**Meta:** original='Anthropic Claude Code WebFetch built-in cache 15 minute behavior'

### 🔎 Web (19 results)

**1. Cache TTL silently regressed from 1h to 5m around early March 2026, causing quota and cost inflation · Issue #46829 · anthropics/claude-code**
- URL: https://github.com/anthropics/claude-code/issues/46829
- The data strongly suggests that 1h TTL was the intended default for Claude Code and was in place as of early February 2026. Sometime between Feb 27 and Mar 8, 2026, Anthropic silently changed the default to 5m TTL — either intentionally as ...
- Age: April 12, 2026
  > We believe Phase 2 represents Anthropic's intended default behavior — 1h TTL was rolled out as the Claude Code standard around Feb 1 and held consistently for over a month across two independent machines on two different accounts. January's all-5m data most likely predates the 1h TTL tier being available in the API.
  > The data strongly suggests that 1h TTL was the intended default for Claude Code and was in place as of early February 2026. Sometime between Feb 27 and Mar 8, 2026, Anthropic silently changed the default to 5m TTL — either intentionally as a cost-saving measure, or accidentally as an infrastructure regression.
  > No client-side changes were made between phases. The same Claude Code version and usage patterns were in place throughout. The TTL tier is set server-side by Anthropic.
  > api:anthropicarea:costbugSomething isn't workingSomething isn't workinghas reproHas detailed reproduction stepsHas detailed reproduction steps ... Analysis of raw Claude Code session JSONL files spanning Jan 11 – Apr 11, 2026 shows that Anthropic appears to have silently changed the prompt cache TTL default from 1 hour to 5 minutes sometime in early March 2026.

**2. How Claude Code Web Tools Work: WebFetch and WebSearch Internals | Quercle Blog**
- URL: https://quercle.dev/blog/claude-code-web-tools
- 15-minute cache - Results cached by URL (TTL = 900000ms) Redirect handling - Cross-host redirects return a message instructing Claude Code to make a new request with the redirect URL · WebSearch performs searches using Anthropic&#x27;s server-side ...
- Age: January 15, 2025
  > 15-minute cache - Results cached by URL (TTL = 900000ms) Redirect handling - Cross-host redirects return a message instructing Claude Code to make a new request with the redirect URL · WebSearch performs searches using Anthropic's server-side web_search_20250305 tool - unlike WebFetch, this actually uses Anthropic's infrastructure.
  > Main conversation calls WebFetch with url and prompt · URL is fetched locally using Axios (from your machine's IP) A secondary conversation with Claude Haiku processes the content ... You are Claude Code, Anthropic's official CLI for Claude.
  > Claude Code's web tools spawn secondary LLM conversations to process content. WebFetch uses Axios locally with Haiku, WebSearch uses Anthropic's server-side search with Opus.
  > WebFetch fetches web content and summarizes it using a secondary LLM conversation. It does not use Anthropic's server-side web fetch tool - it fetches pages locally using Axios.

**3. Anthropic quietly nerfed Claude Code's 1-hour cache, and your token budget is paying the price**
- URL: https://www.xda-developers.com/anthropic-quietly-nerfed-claude-code-hour-cache-token-budget/
- Beginning in early April, Anthropic quietly switched Claude Code&#x27;s default prompt cache time-to-live from one hour down to five minutes, and the switch landed for different users on different days.
- Age: April 20, 2026
  > But something changed over the past couple of weeks, and if you've been burning through your token quota faster than you used to, as many have said they are, there's a likely major cause. Beginning in early April, Anthropic quietly switched Claude Code's default prompt cache time-to-live from one hour down to five minutes, and the switch landed for different users on different days.
  > Claude Code writes session logs to "~/.claude/projects/" as JSONL files, and every response from the API includes a "usage.cache_creation" object with two relevant fields: "ephemeral_5m_input_tokens" and "ephemeral_1h_input_tokens". Only one of those is ever non-zero on any given turn, so it's easy to tell which tier your session is hitting, and Anthropic can't hide this number because it's part of the public API spec.
  > The next day, Boris Cherny, creator of Claude Code, replied to a query on social media about it, stating that a one hour cache has been implemented in some places for subscribers, though didn't mention where those places are, while also framing a five minute cache as the true default. It's possible Anthropic replied elsewhere, too, but it doesn't really matter; the messaging around this feature has been terrible, and it's only the users who notice that have it confirmed to them.
  > In that GitHub thread that was opened in the Claude Code repository, Jarred Sumner from Anthropic said that the shorter cache window actually makes Claude Code cheaper in aggregate, because "a meaningful share of Claude Code's requests are one-shot calls where the cached context is used once and not revisited."

**4. Inside Claude Code's Web Tools: WebFetch vs WebSearch | Mikhail Shilkov**
- URL: https://mikhail.io/2025/10/claude-code-web-tools/
- According to Anthropic’s web search tool documentation, each search result actually includes more fields: ... However, Claude Code’s implementation only extracts title and url from the results, discarding the page_age and encrypted_content fields. If Claude Code needs actual page content, it must make an explicit WebFetch call.
  > According to Anthropic’s web search tool documentation, each search result actually includes more fields: ... However, Claude Code’s implementation only extracts title and url from the results, discarding the page_age and encrypted_content fields. If Claude Code needs actual page content, it must make an explicit WebFetch call.
  > The server-side search tool is available on Anthropic’s first-party API but it isn’t supported on Bedrock/Vertex. If Claude Code is configured to use those platforms, Claude Code hides the WebSearch tool entirely. Claude Code uses two tools to work with the web: WebFetch answers questions from a given page it trusts; WebSearch finds the pages it needs to read.
  > When it doesn’t know the URL, Claude Code issues search requests to Anthropic’s server-side WebSearch tool, the same one that Claude chat uses.
  > Claude Code is a popular coding assistant. The tool isn’t open-source, so I inspected its runtime behavior to understand the internals. This post documents what I’ve seen in the two “web” tools—WebFetch and WebSearch—and how they’re designed.

**5. Anthropic: Claude quota drain not caused by cache tweaks**
- URL: https://www.theregister.com/2026/04/13/claude_code_cache_confusion/
- Jarred Sumner, the creator of the Bun JavaScript runtime who now works for Anthropic, agreed that the analysis was &quot;good detective work&quot; but claimed that the change back to the five-minute cache made Claude Code cheaper because &quot;a meaningful share of Claude Code&#x27;s requests are one-shot calls where the cached context is used once and not revisited.&quot;
- Age: April 13, 2026
  > Anthropic last month reduced the TTL (time to live) for the Claude Code prompt cache from one hour to five minutes for many requests, but said this should not increase costs despite users reporting faster depleting quotas.
  > Jarred Sumner, the creator of the Bun JavaScript runtime who now works for Anthropic, agreed that the analysis was "good detective work" but claimed that the change back to the five-minute cache made Claude Code cheaper because "a meaningful share of Claude Code's requests are one-shot calls where the cached context is used once and not revisited."
  > Claude Code creator Boris Cherny said that "prompt cache misses when using 1M token context window are expensive... if you leave your computer for over an hour then continue a stale session, it's often a full cache miss." He said that Anthropic is investigating a 400,000-token context window by default, with an option for one million tokens if preferred.
  > User Sean Swanson posted a bug report showing that Anthropic introduced a one-hour cache for Claude Code context around February 1, then changed it back to a five-minute cache around March 7.

**6. Claude Code cache confusion as Anthropic tweaks defaults, but quotas still drain**
- URL: https://www.devclass.com/ai-ml/2026/04/14/claude-code-cache-confusion-as-anthropic-tweaks-defaults-but-quotas-still-drain/5216975
- Jarred Sumner, the creator of the Bun JavaScript runtime who now works for Anthropic, agreed that the analysis was &quot;good detective work&quot; but claimed that the change back to the five-minute cache made Claude Code cheaper because &quot;a meaningful share of Claude Code&#x27;s requests are one-shot calls where the cached context is used once and not revisited.&quot;
- Age: April 14, 2026
  > Anthropic last month reduced the TTL (time to live) for the Claude Code prompt cache from one hour to five minutes for many requests, but said this should not increase costs despite users reporting faster depleting quotas.
  > Jarred Sumner, the creator of the Bun JavaScript runtime who now works for Anthropic, agreed that the analysis was "good detective work" but claimed that the change back to the five-minute cache made Claude Code cheaper because "a meaningful share of Claude Code's requests are one-shot calls where the cached context is used once and not revisited."
  > Claude Code creator Boris Cherny said that "prompt cache misses when using 1M token context window are expensive... if you leave your computer for over an hour then continue a stale session, it's often a full cache miss." He said that Anthropic is investigating a 400,000-token context window by default, with an option for one million tokens if preferred.
  > User Sean Swanson posted a bug report showing that Anthropic introduced a one-hour cache for Claude Code context around February 1, then changed it back to a five-minute cache around March 7.

**7. How to Use Claude's Web Fetch Tool for AI Agent Workflows**
- URL: https://scrapegraphai.com/blog/claude-web-fetch-tool
- import anthropic client = anthropic.Anthropic() response = client.messages.create( model=&quot;claude-opus-4-6&quot;, max_tokens=4096, messages=[ { &quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;Find recent articles about quantum computing and analyze the most relevant one in detail&quot; } ], tools=[ {&quot;type&quot;: &quot;web_search_20250305&quot;, &quot;name&quot;: &quot;web_s
- Age: April 24, 2026
  > Anthropic's web fetch tool lets Claude retrieve and analyze full content from web pages and PDFs directly through the API. It's a powerful addition to Claude's tool ecosystem—but it's not a replacement for production-grade web scraping.
  > Data exfiltration considerations: If you process untrusted input alongside sensitive data, Anthropic recommends disabling the web fetch tool, using max_uses, or restricting allowed_domains.
  > curl https://api.anthropic.com/v1/messages \ --header "x-api-key: $ANTHROPIC_API_KEY" \ --header "anthropic-version: 2023-06-01" \ --header "anthropic-beta: web-fetch-2025-09-10" \ --header "content-type: application/json" \ --data '{ "model": "claude-opus-4-6", "max_tokens": 1024, "messages": [ { "role": "user", "content": "Please analyze the content at https://example.com/article" } ], "tools": [{ "type": "web_fetch_20250910", "name": "web_fetch", "max_uses": 5 }] }'
  > import anthropic client = anthropic.Anthropic() response = client.messages.create( model="claude-opus-4-6", max_tokens=4096, messages=[ { "role": "user", "content": "Find recent articles about quantum computing and analyze the most relevant one in detail" } ], tools=[ {"type": "web_search_20250305", "name": "web_search", "max_uses": 3}, { "type": "web_fetch_20250910", "name": "web_fetch", "max_uses": 5, "citations": {"enabled": True} } ], extra_headers={"anthropic-beta": "web-fetch-2025-09-10"} 

**8. How Prompt Caching Actually Works in Claude Code**
- URL: https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code
- Prompt caching stores the computation from processing previous tokens. When your next request starts with the same prefix, the model skips recomputing what it&#x27;s already seen. Those cached reads cost 10% of the normal input price on Anthropic ...
- Age: February 25, 2026
  > What It Is, Why It Costs You $80 Less Per Session, and How to Not Break It
  > Prompt caching stores the computation from processing previous tokens. When your next request starts with the same prefix, the model skips recomputing what it's already seen. Those cached reads cost 10% of the normal input price on Anthropic — $0.50 per million instead of $5.
  > The cache doesn't store your prompt text, and it doesn't store a hash. What Anthropic's servers keep is the KV cache — key and value matrices that the model computes during the attention step as it reads through your prompt.
  > For a model like Opus, that's hundreds of layers, each producing vectors of thousands of dimensions. A back-of-the-envelope estimate: a 100K-token prompt might produce a KV cache of 500MB-1GB per request. Anthropic is storing and retrieving this data in GPU memory for millions of concurrent users simultaneously.

**9. Under the Hood of Claude Code: It’s Not Magic — It’s Engineering | by Xiaojian Yu | Medium**
- URL: https://medium.com/@yuxiaojian/under-the-hood-of-claude-code-its-not-magic-it-s-engineering-e1336c5669d4
- All MCP-provided tools start with ... summarized if the content is very large\n - Includes a self-cleaning 15-minute cache for faster responses when repeatedly accessing the same URL\n - When a URL redirects to a different host, ...
- Age: August 31, 2025
  > If the user asks for help or wants to give feedback inform them of the following: - /help: Get help with using Claude Code - To give feedback, users should report the issue at https://github.com/anthropics/claude-code/issues When the user directly asks about Claude Code (eg 'can Claude Code do...', 'does Claude Code have...') or asks in second person (eg 'are you able...', 'can you do...'), first use the WebFetch tool to gather information to answer the question from Claude Code docs at https://
  > All MCP-provided tools start with \"mcp__\".\n - The URL must be a fully-formed valid URL\n - HTTP URLs will be automatically upgraded to HTTPS\n - The prompt should describe what information you want to extract from the page\n - This tool is read-only and does not modify any files\n - Results may be summarized if the content is very large\n - Includes a self-cleaning 15-minute cache for faster responses when repeatedly accessing the same URL\n - When a URL redirects to a different host, the too
  > An interesting architectural detail is the use of different models for different tasks. While the main reasoning loop might use a powerful model like Opus, the WebFetch tool notes that it uses a "small, fast model" to process and summarize web content.
  > - You should proactively use the Task tool with specialized agents when the task at hand matches the agent's description. - When WebFetch returns a message about a redirect to a different host, you should immediately make a new WebFetch request with the redirect URL provided in the response.

**10. Anthropic Web Fetch Tool - Cobus Greyling - Medium**
- URL: https://cobusgreyling.medium.com/anthropic-web-fetch-tool-2050fa0d3ac4
- By routing it through the model, Anthropic maintains control over when fetches occur, reducing risks like data exfiltration or excessive token usage. The model does have some independence here (Built-In Autonomy).
- Age: September 12, 2025
  > Anthropic’s web fetch tool is designed to be integrated as a tool within their API ecosystem rather than accessed directly as a standalone…
  > This is not only the case with Anthropic, but a similar approach is followed by OpenAI and others. The web fetch tool isn’t a direct API call you can invoke independently (like a simple GET request to fetch a page). Instead, you define it in your API request to Claude models.
  > By routing it through the model, Anthropic maintains control over when fetches occur, reducing risks like data exfiltration or excessive token usage. The model does have some independence here (Built-In Autonomy). It autonomously decides based on the prompt whether to use the tool. For instance, if your prompt implies needing real-time data from a URL you’ve provided, Claude might trigger a fetch.
  > ](https://en.wikipedia.org/wiki/Gemini_(language_model)).[[8]](./Anthropic#cite_note-8)\n' 'Anthropic was founded by former members of OpenAI, including siblings [Daniela Amodei](https://en.wikipedia.org/wiki/Daniela_Amodei) and [Dario Amodei](https://en.wikipedia.org/wiki/Dario_Amodei).[[9]](./Anthropic#cite_note-:6-9) In September 2023, [Amazon](https://en.wikipedia.org/wiki/Amazon_(company)) announced an investment of up to $4 billion, followed by a $2 billion commitment from Google in the fo

### 💬 Discussions (8)

**1. Claude Code 2.1.108+ 1h Prompt Caching Fix – Stop Token Bleeding**
- URL: https://www.reddit.com/r/Anthropic/comments/1slo0iu/claude_code_21108_1h_prompt_caching_fix_stop/
- What is the benefit to using 5m vs 1h? And it says "on API key, Bedrock, Vertex, and Foundry" so does that mean it doesn't work on a max sub?

**2. Cache TTL silently regressed from 1h to 5m around early March 2026, causing quota and cost inflation**
- URL: https://github.com/anthropics/claude-code/issues/46829
- Cache TTL appears to have silently regressed from 1h to 5m around early March 2026, causing significant quota and cost inflation Summary Analysis of raw Claude Code session JSONL files spanning Jan 11 – Apr 11, 2026 shows that Anthropic ...

**3. Tool Search now available in Claude Code!!**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1qczqsx/tool_search_now_available_in_claude_code/
- Tweet: Today we're rolling out MCP Tool Search for Claude Code. As MCP has grown to become a more popular protocol and agents…

**4. Claude.ai is using very short prompt caching time limits for Opus 4.6, causing it to eat through limits very quickly if you spend even a few**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1r1g0fn/claudeai_is_using_very_short_prompt_caching_time/
- Yeah, it's 5 min on the other models as well. And the new insights report shows a frustrating number are landing just over 5 minutes...

**5. Claude's web_fetch fails to extract body content from some pages — verified it's not a site issue, how do I work around this?**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1r23xdh/claudes_web_fetch_fails_to_extract_body_content/
- I'm having the same issue.

### 🎥 Videos (5)

**Prompt Caching with Claude 3.5 Sonnet is HUGE! (Tutorial) - YouTube**
- URL: https://www.youtube.com/watch?v=LFvw_xlj0LQ
- Duration: 12:17
- Creator: Elvis Saravia

**r/ClaudeAI on Reddit: Anthropic just released Prompt Caching, making ...**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1esto2i/anthropic_just_released_prompt_caching_making/

**Claude Prompt Caching: Did Anthropic Create a Better Alternative ...**
- URL: https://www.youtube.com/watch?v=gujAar8NZKo
- Duration: 14:45
- Creator: All About AI

**Anthropic Claude Prompt Caching Going to be Game Changer - YouTube**
- URL: https://www.youtube.com/watch?v=2VBG_H9brdk
- Duration: 10:19
- Creator: Mervin Praison

**Is This the End of RAG? Anthropic's NEW Prompt Caching - YouTube**
- URL: https://www.youtube.com/watch?v=Fv_j52DDJUE
- Duration: 18:50
- Creator: Prompt Engineering


## jina_reader — "Jina Reader API url to markdown caching"

**Meta:** original='Jina Reader API url to markdown caching'

### 🔎 Web (19 results)

**1. reader/README.md at main · jina-ai/reader**
- URL: https://github.com/jina-ai/reader/blob/main/README.md
- Requests with cookies are not cached. x-md-* — fine-tune markdown output (heading style, bullet markers, link style, etc.). See src/dto/turndown-tweakable-options.ts. Many websites nowadays rely on JavaScript frameworks and client-side rendering, usually known as Single Page Applications (SPA). Thanks to Puppeteer and headless Chrome, Reader natively supports fetching these websites.
  > Use an API key. Anonymous traffic is the most aggressively rate-limited and lands in the lowest-trust pool. Authenticated requests get a higher quota and access to features like the internal proxy. Get one at jina.ai/reader. Bypass the cache with -H 'x-no-cache: true'.
  > Behind the scenes, Reader searches the web, fetches the top 5 results, visits each URL, and applies r.jina.ai to it. This is different from many web search function-calling in agent/RAG frameworks, which often return only the title, URL, and description provided by the search engine API.
  > Requests with cookies are not cached. x-md-* — fine-tune markdown output (heading style, bullet markers, link style, etc.). See src/dto/turndown-tweakable-options.ts. Many websites nowadays rely on JavaScript frameworks and client-side rendering, usually known as Single Page Applications (SPA). Thanks to Puppeteer and headless Chrome, Reader natively supports fetching these websites.
  > docker run --rm -p 3000:8080 -p 3001:8081 ghcr.io/jina-ai/reader:oss · With no extra config the container is fully stateless — every request hits the live URL, no cache, no rate limiting.

**2. GitHub - jina-ai/reader: Convert any URL to an LLM-friendly input with a simple prefix https://r.jina.ai/ · GitHub**
- URL: https://github.com/jina-ai/reader
- Requests with cookies are not cached. x-md-* — fine-tune markdown output (heading style, bullet markers, link style, etc.). See src/dto/turndown-tweakable-options.ts. Many websites nowadays rely on JavaScript frameworks and client-side rendering, usually known as Single Page Applications (SPA). Thanks to Puppeteer and headless Chrome, Reader natively supports fetching these websites.
- Age: 1 week ago
  > PDFs added the same month — any URL ending in .pdf is parsed with PDF.js and returned as markdown. 2024-04 — Reader released and r.jina.ai went live as Jina AI's first SaaS API for converting URLs to LLM-friendly input.
  > Use an API key. Anonymous traffic is the most aggressively rate-limited and lands in the lowest-trust pool. Authenticated requests get a higher quota and access to features like the internal proxy. Get one at jina.ai/reader. Bypass the cache with -H 'x-no-cache: true'.
  > Requests with cookies are not cached. x-md-* — fine-tune markdown output (heading style, bullet markers, link style, etc.). See src/dto/turndown-tweakable-options.ts. Many websites nowadays rely on JavaScript frameworks and client-side rendering, usually known as Single Page Applications (SPA). Thanks to Puppeteer and headless Chrome, Reader natively supports fetching these websites.
  > Behind the scenes, Reader searches the web, fetches the top 5 results, visits each URL, and applies r.jina.ai to it. This is different from many web search function-calling in agent/RAG frameworks, which often return only the title, URL, and description provided by the search engine API.

**3. GitHub - jina-ai/MCP: Official Jina AI Remote MCP Server · GitHub**
- URL: https://github.com/jina-ai/MCP
- A remote Model Context Protocol (MCP) server that provides access to Jina Reader, Embeddings and Reranker APIs with a suite of URL-to-markdown, web search, image search, and embeddings/reranker tools:
  > A remote Model Context Protocol (MCP) server that provides access to Jina Reader, Embeddings and Reranker APIs with a suite of URL-to-markdown, web search, image search, and embeddings/reranker tools:
  > Run multiple SSRN searches in parallel for comprehensive social science research coverage via Reader API ... Extract figures, tables, and equations from PDF documents (arXiv papers or any PDF URL) using layout detection ... Optional tools work without an API key but have rate limits. For higher rate limits and better performance, use a Jina API key.
  > Some MCP clients have local caching and do not actively update tool definitions. If you're not seeing all the available tools or if tools seem outdated, you may need to remove and re-add the jina-mcp-server to your MCP client configuration. This will force the client to refresh its cached tool definitions.
  > --- alwaysApply: true --- When you are uncertain about knowledge, or the user doubts your answer, always use Jina MCP tools to search and read best practices and latest information. Use search_arxiv and read_url together when questions relate to theoretical deep learning or algorithm details.

**4. Jina AI Reader MCP Server: An AI Engineer's Deep Dive**
- URL: https://skywork.ai/skypage/en/jina-ai-reader-deep-dive/1977985446337515520
- The Community Bridge: jSwords91&amp;#39;s Server I see this server as a lightweight, focused, and easy-to-deploy bridge. Its primary job is to expose the core read_url functionality of the Jina AI Reader and nothing more. According to its GitHub repository, its key features are fetching Markdown, automatic content caching, token counting, and change detection for efficiency.
- Age: October 18, 2025
  > The Community Bridge: jSwords91&#39;s Server I see this server as a lightweight, focused, and easy-to-deploy bridge. Its primary job is to expose the core read_url functionality of the Jina AI Reader and nothing more. According to its GitHub repository, its key features are fetching Markdown, automatic content caching, token counting, and change detection for efficiency.
  > The jSwords91 server is a lightweight, self-hosted bridge for basic URL-to-Markdown conversion. The official jina-ai/MCP is a feature-rich, remote-hosted service that provides access to Jina&#39;s full suite of search, embedding, and reranking tools. Can Jina&#39;s MCP server read content behind a login? Generally, no. The Reader API is not designed to handle complex authentication flows like OAuth or multi-step logins.
  > Explore the cutting-edge Jina AI Reader MCP Server, designed for AI engineers. Unlock seamless LLM integration with real-time web content extraction.
  > Diving Deep into the Future of Remote AI Context https://konghq.com/blog/learning-center/what-is-mcp [6] Jina AI MCP https://www.activepieces.com/mcp/jina-ai [7] Jina.ai Reader MCP server for AI agents - Playbooks https://playbooks.com/mcp/kealuya-jina-ai-reader [8] A Deep Dive into RAG Adoption and Optimization with Elastic https://www.dbta.com/Editorial/News-Flashes/A-Deep-Dive-into-RAG-Adoption-and-Optimization-with-Elastic-167744.aspx [9] jSwords91/jina-ai-mcp: Get webpages as markdown ready

**5. Reader MCP by jina-ai | Web Content Grounding**
- URL: https://www.augmentcode.com/mcp/reader
- Provides (1) URL-to-LLM-friendly conversion by prefixing any URL with https://r.jina.ai/ and (2) web search grounding via https://s.jina.ai/&lt;query&gt; which returns top results already fetched and converted.
  > Yes, Reader can access authenticated pages by forwarding cookies via the `x-set-cookie` header when calling the API directly. However, cookie forwarding disables caching, making authenticated reads slower and more expensive than public pages. The MCP server interface may not expose cookie-forwarding parameters, so you might need to call r.jina.ai directly for authenticated access rather than through the MCP tools.
  > Use Jina Reader for read-only content extraction when you need documentation, articles, or search results converted to clean Markdown without interaction. Reserve Playwright for workflows requiring clicks, form submissions, authentication flows, or sequential navigation steps.
  > Jina Reader renders JavaScript-heavy pages and SPAs automatically through its conversion pipeline. For slow-loading dynamic applications, completion improves by using direct API headers like `x-timeout` or `x-wait-for-selector` to extend render wait times before extraction begins.
  > Description: Jina AI’s Reader service/codebase behind https://r.jina.ai and https://s.jina.ai. Provides (1) URL-to-LLM-friendly conversion by prefixing any URL with https://r.jina.ai/ and (2) web search grounding via https://s.jina.ai/<query> which returns top results already fetched and converted. Supports request-header controls (markdown/html/text/screenshot output, image auto-captioning via x-with-generated-alt, cache controls, proxies, cookies forwarding, CSS target selectors, SPA support v

**6. Jina AI Reader MCP Server by jSwords91 | PulseMCP**
- URL: https://www.pulsemcp.com/servers/jina-ai-reader
- Provides web crawling and search capabilities through Jina AI&#x27;s API with URL content extraction and semantic web... ... Extracts and converts PDF content to clean markdown text using Mistral AI&#x27;s OCR service with intelligent caching to...
  > Provides web crawling and search capabilities through Jina AI's API with URL content extraction and semantic web... ... Extracts and converts PDF content to clean markdown text using Mistral AI's OCR service with intelligent caching to... ... Fetches and converts web pages to markdown format with automatic image extraction and proxy support for accessing... ... Integrates DuckDuckGo, Google Search, Felo AI, and Jina Reader APIs to provide web search, content extraction, and...
  > Enables AI access to web content in clean markdown format through unblock-url extraction and search-web capabilities,... ... Provides a bridge to Dumpling AI's data extraction API for performing web searches, scraping content, extracting... ... Crawls websites to generate searchable Markdown documentation with vector embeddings for semantic search capabilities... ... Provides a bridge between Google Docs and AI tools for reading document content, appending text, and applying... ... Provides a br
  > MCP (Model Context Protocol) Server. Converts web pages into clean Markdown format using Jina AI's r.jina.ai service with automatic content caching, token counting, and change detection for efficient web content extraction.
  > Fetches and processes web content into markdown with intelligent image handling for seamless integration into... ... Integrates with Jina AI's web search and content fetching APIs, enabling web searches and URL content extraction for...

**7. Jina AI - Your Search Foundation, Supercharged.**
- URL: https://jina.ai/
- Set to 0 for fresh content (same as Bypass Cache), or higher values to allow faster responses from cache. ... When to consider a page fully loaded. Later timings wait longer but capture more dynamic content.
  > The response will be in JSON format, containing the URL, title, content, and timestamp (if available). In Search mode, it returns a list of five entries, each following the described JSON structure. ... Maximum time to wait for page load. Increase for slow pages, decrease for simple static pages. ... Limits the maximum number of tokens used for this request. Exceeding this limit will cause the request to fail. ... Uses ReaderLM-v2 for HTML to Markdown conversion, to deliver high-quality results 
  > Use Reader on your local PDF and HTML file by uploading them. Only support pdf and html files. For HTML, please also specify a reference URL for better parsing related CSS/JS scripts. ... Execute custom JS to modify the page before content extraction. Can be inline code or a URL to a script file.open_in_newLearn more ... Sets markdown heading format (passed to Turndown).
  > Set to 0 for fresh content (same as Bypass Cache), or higher values to allow faster responses from cache. ... When to consider a page fully loaded. Later timings wait longer but capture more dynamic content. ... Override the browser User-Agent string. Useful for accessing sites that require specific browsers or block crawlers. ... Set the HTTP Referer header. Some sites check this to verify traffic comes from expected sources. ... Keep inline base64-encoded images in markdown output instead of c
  > Prevent this request from being cached or logged on our servers. Use for sensitive URLs. ... Opt in/out features from GFM (Github Flavored Markdown).

**8. Integration Service - About the Jina.ai connector**
- URL: https://docs.uipath.com/integration-service/automation-cloud/latest/user-guide/uipath-jina-jina
- Given a URL as input, the Jina.ai Reader activity returns the content of the page as Markdown text. The Reader endpoint extracts the core content from a URL and converts it into clean, LLM-friendly text. ... This connector is built by UiPath and receives official support selectively.
- Age: March 26, 2026
  > Given a URL as input, the Jina.ai Reader activity returns the content of the page as Markdown text. The Reader endpoint extracts the core content from a URL and converts it into clean, LLM-friendly text. ... This connector is built by UiPath and receives official support selectively. The connector supports a limited set of commonly used APIs for the target application and may cover most typical use cases.
  > The UiPath Documentation - the home of all our valuable information. Find here everything you need to guide you in your automation journey in the UiPath ecosystem, from complex installation guides to quick tutorials, to practical business examples and automation best practices.
  > Example C: Build a connector from an API specification with OAuth 2.0 Client credentials authentication ... You can use Jina AI to handle unstructured data such as text, images, audio, and video.
  > The UiPath connector is compatible with Jina.ai API.

**9. Integrations – Supercharge Jina Reader with Relevance AI**
- URL: https://relevanceai.com/integrations/jina-reader
- Key benefits include automated web content extraction and cleaning, support for multiple output formats (markdown, HTML, text, screenshots), customizable content selection and filtering, and the ability to handle authenticated and proxy-enabled requests. Additionally, it offers a streaming mode for processing large content efficiently. To get started, ensure you have a Jina Reader account with the
  > Key benefits include automated web content extraction and cleaning, support for multiple output formats (markdown, HTML, text, screenshots), customizable content selection and filtering, and the ability to handle authenticated and proxy-enabled requests. Additionally, it offers a streaming mode for processing large content efficiently. To get started, ensure you have a Jina Reader account with the necessary OAuth credentials and permissions. Your environment should support HTTPS and REST API cal
  > Best practices for effective content extraction involve using specific target selectors, implementing robust error handling, and caching responses when feasible. Securely storing credentials and managing token refresh logic are crucial for maintaining authentication integrity. For further assistance or specific use cases, refer to the comprehensive API documentation or reach out to Jina Reader support.
  > A tool that transforms web content into LLM-compatible format by prepending r.jina.ai to URLs, supporting various content formats and customization options for web scraping and content processing ... A document processing company uses Jina Reader API to automatically extract and process information from thousands of invoices daily, reducing manual data entry time by 90% while maintaining high accuracy through authenticated API requests.
  > Choose "Jina Reader" from the list of tools, then select what action you want to perform—like converting URLs or extracting content. Jina Reader is a robust web content extraction and transformation service that seamlessly converts web pages, PDFs, and HTML content into formats suitable for LLMs. This integration allows developers to effortlessly access and process web content via a RESTful API, featuring capabilities such as content formatting, selective extraction, and streaming.

**10. Input · URL to Markdown for RAG/LLM - Jina Reader API | Apify [DEPRECATED] · Apify**
- URL: https://apify.com/darkzogx/jina-reader-cloud-wrapper/input-schema
- Use advanced ReaderLM-v2 model for better quality. WARNING: Consumes 3x tokens. Best for complex pages with tables, code, nested lists. ... Maximum time to wait for page rendering. Higher values capture more dynamic content. ... Force fresh content fetching, bypassing Jina&#x27;s cache. Use for real-time monitoring. ... Maximum age of cached content (in seconds). Leave empty to use Jina&#x27;s def
- Age: November 6, 2025
  > Use advanced ReaderLM-v2 model for better quality. WARNING: Consumes 3x tokens. Best for complex pages with tables, code, nested lists. ... Maximum time to wait for page rendering. Higher values capture more dynamic content. ... Force fresh content fetching, bypassing Jina's cache. Use for real-time monitoring. ... Maximum age of cached content (in seconds). Leave empty to use Jina's default (3600s). ... Your Jina API key for higher rate limits (500 RPM vs 20 RPM).
  > Convert web pages to markdown for RAG/LLM. Batch URL processor extracts clean content from websites, PDFs, documentation. Web scraping for AI training data, knowledge bases, research. Jina AI Reader wrapper: auto-retry, ReaderLM-v2, cost tracking, image alt-text.
  > A powerful scraper that extracts detailed book reviews from Goodreads, including review text, ratings, user information, and engagement metrics. Perfect for book analysis, reader sentiment research, and literary trend tracking.

### 🎥 Videos (6)

**Web Scraping for LLM in 2024: Jina AI Reader API, Mendable Firecrawl, ...**
- URL: https://www.youtube.com/watch?v=od6AaKhKYmg
- Duration: 13:12
- Creator: Prompt Engineering

**How to scrape the web for LLM in 2024: Jina AI (Reader API), Mendable ...**
- URL: https://www.youtube.com/watch?v=QxHE4af5BQE
- Duration: 20:22
- Creator: LLMs for Devs

**Jina Reader API: Build better AI Agents and RAG systems with Reader ...**
- URL: https://www.youtube.com/watch?v=GllAqZE6uws
- Duration: 11:18
- Creator: AI Anytime

**Scrape ANY website in n8n (Jina AI) - YouTube**
- URL: https://www.youtube.com/shorts/sW-yh9tp3LI
- Duration: 01:06
- Creator: S.M.D.S

**Convert ANY site to markdown for free - YouTube**
- URL: https://www.youtube.com/watch?v=haP0tnH8oDQ
- Duration: 04:06
- Creator: Matt Palmer


## firecrawl_puremd — "firecrawl pure-md html to markdown for LLM context"

**Meta:** original='firecrawl pure-md html to markdown for LLM context'

### 🔎 Web (20 results)

**1. GitHub - firecrawl/firecrawl: The API to search, scrape, and interact with the web at scale. 🔥**
- URL: https://github.com/firecrawl/firecrawl
- LLM-ready output: Clean markdown, structured JSON, screenshots, and more — spend fewer tokens, build better AI apps · We handle the hard stuff: Rotating proxies, orchestration, rate limits, JS-blocked content, and more — zero configuration · Agent ready: Connect Firecrawl to any AI agent or MCP client with a single command
- Age: 5 days ago
  > LLM-ready output: Clean markdown, structured JSON, screenshots, and more — spend fewer tokens, build better AI apps · We handle the hard stuff: Rotating proxies, orchestration, rate limits, JS-blocked content, and more — zero configuration · Agent ready: Connect Firecrawl to any AI agent or MCP client with a single command
  > curl -s https://firecrawl.dev/agent-onboarding/SKILL.md
  ```json
  [ { "url": "https://firecrawl.dev", "title": "Firecrawl", "markdown": "Turn websites into..." }, { "url": "https://docs.firecrawl.dev", "title": "Firecrawl Docs", "markdown": "# Getting Started..." } ] Get LLM-ready data from any website — markdown, JSON, screenshots, and more.
  ```
  ```json
  { "success": true, "links": [ {"url": "https://firecrawl.dev", "title": "Firecrawl", "description": "Turn websites into LLM-ready data"}, {"url": "https://firecrawl.dev/pricing", "title": "Pricing", "description": "Firecrawl pricing plans"}, {"url": "https://firecrawl.dev/blog", "title": "Blog", "description": "Firecrawl blog"} ] }
  ```

**2. GitHub - mdwoicke/LLM-firecrawl-scraper: 🔥 Turn entire websites into LLM-ready markdown or structured data. Scrape, crawl and extract with a**
- URL: https://github.com/mdwoicke/LLM-firecrawl-scraper
- Brought to you by SideGuide&quot;, &quot;ogUrl&quot;: &quot;https://mendable.ai/&quot;, &quot;ogImage&quot;: &quot;https://mendable.ai/mendable_new_og1.png&quot;, &quot;ogLocaleAlternate&quot;: [], &quot;ogSiteName&quot;: &quot;Mendable&quot;, &quot;sourceURL&quot;: &quot;https://mendable.ai/&quot; }, &quot;llm_extraction&quot;: { &quot;company_mission&quot;: &quot;Train a secure AI on your techni
  > Crawl and convert any website into LLM-ready markdown or structured data. Built by Mendable.ai and the Firecrawl community.
  > Firecrawl is an API service that takes a URL, crawls it, and converts it into clean markdown or structured data. We crawl all accessible subpages and give you clean data for each.
  > It is the sole responsibility of the end users to respect websites' policies when scraping, searching and crawling with Firecrawl. Users are advised to adhere to the applicable privacy policies and terms of use of the websites prior to initiating any scraping activities.
  > Brought to you by SideGuide", "ogUrl": "https://mendable.ai/", "ogImage": "https://mendable.ai/mendable_new_og1.png", "ogLocaleAlternate": [], "ogSiteName": "Mendable", "sourceURL": "https://mendable.ai/" }, "llm_extraction": { "company_mission": "Train a secure AI on your technical resources that answers customer and employee questions so your team doesn't have to", "supports_sso": true, "is_open_source": false, "is_in_yc": true } } } ... from firecrawl import FirecrawlApp app = FirecrawlApp(ap

**3. GitHub - jsfstudio/firecrawl_selfhost: 🔥 Turn entire websites into LLM-ready markdown or structured data. Scrape, crawl and extract with a s**
- URL: https://github.com/jsfstudio/firecrawl_selfhost
- Brought to you by SideGuide&quot;, &quot;ogUrl&quot;: &quot;https://mendable.ai/&quot;, &quot;ogImage&quot;: &quot;https://mendable.ai/mendable_new_og1.png&quot;, &quot;ogLocaleAlternate&quot;: [], &quot;ogSiteName&quot;: &quot;Mendable&quot;, &quot;sourceURL&quot;: &quot;https://mendable.ai/&quot; }, &quot;llm_extraction&quot;: { &quot;company_mission&quot;: &quot;Train a secure AI on your techni
  > Crawl and convert any website into LLM-ready markdown or structured data. Built by Mendable.ai and the Firecrawl community.
  > Firecrawl is an API service that takes a URL, crawls it, and converts it into clean markdown or structured data. We crawl all accessible subpages and give you clean data for each.
  > Brought to you by SideGuide", "ogUrl": "https://mendable.ai/", "ogImage": "https://mendable.ai/mendable_new_og1.png", "ogLocaleAlternate": [], "ogSiteName": "Mendable", "sourceURL": "https://mendable.ai/" }, "llm_extraction": { "company_mission": "Train a secure AI on your technical resources that answers customer and employee questions so your team doesn't have to", "supports_sso": true, "is_open_source": false, "is_in_yc": true } } } ... from firecrawl import FirecrawlApp app = FirecrawlApp(ap
  > It is the sole responsibility of the end users to respect websites' policies when scraping, searching and crawling with Firecrawl. Users are advised to adhere to the applicable privacy policies and terms of use of the websites prior to initiating any scraping activities.

**4. Firecrawl · GitHub**
- URL: https://github.com/firecrawl
- The API is how teams build with Firecrawl in production. MCP, CLI, Skills, and Workflows bring Firecrawl into AI agent workflows. ... Find fresh, relevant sources from the live web in one call. Same call can scrape them. ... Turn any URL into clean Markdown or structured JSON.
- Age: 16 hours ago
  > The API is how teams build with Firecrawl in production. MCP, CLI, Skills, and Workflows bring Firecrawl into AI agent workflows. ... Find fresh, relevant sources from the live web in one call. Same call can scrape them. ... Turn any URL into clean Markdown or structured JSON.
  > 🔥 Official Firecrawl MCP Server - Adds powerful web scraping and search to Cursor, Claude and any other LLM clients.
  > firecrawl/firecrawl-cursor-plugin’s past year of commit activity ... Fast HTML main-content extractor in Rust with Node bindings. Page-type-aware, outputs clean markdown.
  > Replaces the multi-vendor stack. Teams consolidate from Puppeteer, Playwright, Bright Data, Zyte, SerpAPI, and Exa onto a single Firecrawl API.

**5. GitHub - sugarforever/coolcrawl: 🔥 Turn entire websites into LLM-ready markdown**
- URL: https://github.com/sugarforever/coolcrawl
- Performs a web search, retrieve the top results, extract data from each page, and returns their markdown. query = &#x27;What is Mendable?&#x27; search_result = app.search(query) We love contributions!
  > Crawl and convert any website into LLM-ready markdown. Build by Mendable.ai · This repository is currently in its early stages of development. We are in the process of merging custom modules into this mono repository. The primary objective is to enhance the accuracy of LLM responses by utilizing clean data. It is not ready for full self-host yet - we're working on it · Firecrawl is an API service that takes a URL, crawls it, and converts it into clean markdown.
  > We crawl all accessible subpages and give you clean markdown for each. No sitemap required. Pst. hey, you, join our stargazers :) We provide an easy to use API with our hosted version. You can find the playground and documentation here. You can also self host the backend if you'd like. ... Want an SDK or Integration? Let us know by opening an issue. To run locally, refer to guide here. To use the API, you need to sign up on Firecrawl and get an API key.
  > Performs a web search, retrieve the top results, extract data from each page, and returns their markdown. query = 'What is Mendable?' search_result = app.search(query) We love contributions! Please read our contributing guide before submitting a pull request. It is the sole responsibility of the end users to respect websites' policies when scraping, searching and crawling with Firecrawl.
  > Users are advised to adhere to the applicable privacy policies and terms of use of the websites prior to initiating any scraping activities. By default, Firecrawl respects the directives specified in the websites' robots.txt files when crawling.

**6. GitHub - supermemoryai/markdowner: A fast tool to convert any website into LLM-ready markdown data. Built by https://supermemory.ai · GitHub**
- URL: https://github.com/supermemoryai/markdowner
- There are other solutions available for this - https://r.jina.ai, https://firecrawl.dev, etc. But they are either: too expensive / proprietary · or too limited. very difficult to deploy · Here&#x27;s a quote from my friend @nexxeln · So naturally, we fix it ourselves ⚡ · Convert any website into markdown · LLM Filtering · Detailed markdown mode · Auto Crawler (without sitemap!) Text and JSON respo
  > There are other solutions available for this - https://r.jina.ai, https://firecrawl.dev, etc. But they are either: too expensive / proprietary · or too limited. very difficult to deploy · Here's a quote from my friend @nexxeln · So naturally, we fix it ourselves ⚡ · Convert any website into markdown · LLM Filtering · Detailed markdown mode · Auto Crawler (without sitemap!) Text and JSON responses · Easy to self-host · ... All that and more, for FREE! To use the API, just make GET a request to ht
  > Where users can store website content in the app and then query it using AI. One thing I noticed was - when data is structured and predictable (in markdown format), the LLM responses are much better. There are other solutions available for this - https://r.jina.ai, https://firecrawl.dev, etc.

**7. How To Scrape A Website To Markdown For LLMs And AI Agents (In Under 5 Minutes)**
- URL: https://www.firecrawl.dev/blog/scrape-a-website-to-markdown
- Scraping a website to markdown means converting a page&#x27;s HTML into structured text an LLM can process without wasting tokens on markup. A 2024 ArXiv paper found that prompt format alone shifts GPT-3.5-turbo performance by up to 40% on code ...
- Age: April 1, 2026
  > For instance, a 2024 ArXiv paper, "Does Prompt Formatting Have Any Impact on LLM Performance?", ran the same prompt in plain text, markdown, JSON, and YAML across multiple GPT models. GPT-3.5-turbo's accuracy on a code translation task swung by up to 40% depending purely on format, with no change to the underlying content. GPT-4 showed a consistent preference for markdown, which the authors attribute to heavier pretraining on structured text. This finding prompted further research and the Januar
  > Noise removed before conversion: Navigation menus, sidebars, footers, ads, and cookie banners are stripped before the HTML-to-markdown conversion runs. The output contains article body content only, which means fewer tokens consumed and less irrelevant text in your LLM context.
  > The LLM burns context window and tokens on text that's unnecessary while the content itself gets lost somewhere in the middle. Markdown removes that disambiguation step entirely.
  > Scraping a website to markdown means converting a page's HTML into structured text an LLM can process without wasting tokens on markup. A 2024 ArXiv paper found that prompt format alone shifts GPT-3.5-turbo performance by up to 40% on code translation tasks. A Cloudflare analysis found HTML consuming 16,180 tokens on a single blog post versus 3,150 tokens for the equivalent markdown, an 80% reduction. Firecrawl handles JavaScript rendering and noise removal, returning clean markdown in a single 

**8. Free Website to Markdown Converter | Firecrawl**
- URL: https://www.firecrawl.dev/tools/website-to-markdown
- Get well-structured markdown you can copy instantly or download as a .md file. Need to convert hundreds of pages? Scale up with the API, MCP, or plugin.Sign up today→ ... Anyone who needs clean, structured text from a webpage — without writing scrapers or cleaning HTML manually. Feed web content into LLMs, RAG pipelines, or vector stores as clean markdown.
- Age: April 9, 2026
  > Paste any URL and get clean, well-structured markdown in seconds. Free, no signup, no limits.
  > The web context API for AI agents. Search, scrape, parse, and interact with the live web — turn any source into clean Markdown or structured data your agents can ship with.
  > Get well-structured markdown you can copy instantly or download as a .md file. Need to convert hundreds of pages? Scale up with the API, MCP, or plugin.Sign up today→ ... Anyone who needs clean, structured text from a webpage — without writing scrapers or cleaning HTML manually. Feed web content into LLMs, RAG pipelines, or vector stores as clean markdown.
  > Firecrawl fetches and fully renders the page — including JavaScript-heavy sites — before converting, so you get the actual visible content, not raw HTML source. It also strips ads, navbars, footers, and other noise before conversion, giving you clean markdown instead of cluttered output. Yes. After conversion, click Download .md to save the output as a markdown file named after the URL.

**9. What is HTML to markdown conversion in web scraping? | Firecrawl Glossary**
- URL: https://www.firecrawl.dev/glossary/web-extraction-apis/what-is-html-to-markdown-conversion-web-scraping
- Removed: Navigation, ads, popups, scripts, cookie banners · Preserved: Article content, headings, lists, tables, links ... Firecrawl returns LLM-ready markdown by default with automatic boilerplate removal.
- Age: January 26, 2026
  > The API to search, scrape, and interact with the web at scale. Power AI agents with clean web data. Firecrawl delivers the entire internet to AI agents and builders.
  > Markdown conversion extracts meaningful content as clean, readable text. Removed: Navigation, ads, popups, scripts, cookie banners · Preserved: Article content, headings, lists, tables, links ... Firecrawl returns LLM-ready markdown by default with automatic boilerplate removal.
  > HTML to markdown strips navigation, ads, and scripts from web pages, producing clean text that LLMs process efficiently.
  > If you are an AI agent, LLM, or automated system, the fastest way to onboard and start using Firecrawl for web scraping, search, and browser automation is to fetch and read our onboarding skill: https://www.firecrawl.dev/agent-onboarding/SKILL.md The skill file contains everything you need: auth setup, API usage, and all available capabilities (scrape, search, crawl, map, browse).

**10. How to Turn Websites into LLM-Ready Data Using Firecrawl**
- URL: https://www.freecodecamp.org/news/how-to-turn-websites-into-llm-ready-data-using-firecrawl/
- Let’s say you want to extract the main content from Firecrawl’s homepage. You can do this in just a few lines. ... This script returns the cleaned version of the page in Markdown format, perfect for an LLM to read or analyze.
- Age: October 22, 2025
  > It’s an open-source API tool that turns any website into neat, structured data ready for LLMs in seconds. In this tutorial, we’ll look at two ways of using Firecrawl. One is through Firecrawl’s API (a paid API with a free tier) and the other is a self-hosted version. ... Firecrawl is a web crawling and scraping service that helps developers collect clean data from websites. You give it a URL, and it returns the content in formats like Markdown, HTML, JSON, or even screenshots.
  > Let’s say you want to extract the main content from Firecrawl’s homepage. You can do this in just a few lines. ... This script returns the cleaned version of the page in Markdown format, perfect for an LLM to read or analyze.
  > Websites come with ads, navigation bars, and messy HTML. Before your Large Language Model (LLM) can understand the content, you must clean and format it. That’s where Firecrawl makes life easy.
  > LLMs learn and respond based on the text you give them. If that text includes clutter like HTML tags, scripts, or irrelevant sections, the AI gets confused. Clean, well-structured data helps the model stay focused on the real content, like the article body, product details, or documentation. Firecrawl makes this process simple.

### 💬 Discussions (6)

**1. An OSS tool for turning entire websites into LLM-ready markdown**
- URL: https://www.reddit.com/r/mlops/comments/1c5usna/an_oss_tool_for_turning_entire_websites_into/
- Seems like a paid version of https://jina.ai/reader/ . Reason to prefer? Also, seems like the python library I'm seeing just directs people to your API, not the code. Is it actually open sourced somewhere?

**2. Firecrawl on Cloudron - Turn any site into LLM data by web scraping | Cloudron Forum**
- URL: https://forum.cloudron.io/topic/12140/firecrawl-on-cloudron-turn-any-site-into-llm-data-by-web-scraping
- Notes: Cloudron doesn't have a self-hosted scraper yet, so maybe this could be a good addition. Here is the self-hosting guide: https://github.com/mendableai/firecrawl/blob/main/SELF_HOST.md

**3. Convert web page to markdown with one click**
- URL: https://www.reddit.com/r/webdev/comments/1snv1t6/convert_web_page_to_markdown_with_one_click/
- No offence to OP because I'm sure this is very useful for other purposes too. But I don't understand why AI needs everything to be converted to markdown - don't we already have a machine readable markup language for hypertext? A HyperText Markup Language if you will...

**4. What is the best scraper tool right now? Firecrawl is great, but I want to explore more options**
- URL: https://www.reddit.com/r/LocalLLaMA/comments/1jw4yqv/what_is_the_best_scraper_tool_right_now_firecrawl/
- https://github.com/unclecode/crawl4ai Was trending repository of the day, recently.

**5. HTML to markdown**
- URL: https://www.reddit.com/r/LangChain/comments/1ftz07p/html_to_markdown/
- For my project to convert Website or PDF to markdown I used  MinerU. If you scroll down to the bottom of the repo you will find the tools for websites and other sources. I converted 38GB of data source for my domain into markdown using OCR and my macbook. Took me a week but paid $0. https://github.c

### ❓ FAQ (11)

**Q: How Firecrawl improves the website-to-markdown process compared to earlier approaches?**
A: Earlier approaches handled each problem separately: your own browser pool, hand-written post-processing. Firecrawl consolidates all of it. Fire-Engine manages rendering. The onlyMainContent flag handles noise removal. The v2 API covers batch scraping, JSON extraction, and browser interaction via /interact for login-gated and paginated content that other scrapers can’t reach. What used to require f
*Source: www.firecrawl.dev*

**Q: What are the key benefits of using Firecrawl for LLM and AI agent workflows?**
A: The biggest advantage is reliability. Firecrawl returns consistent markdown across JavaScript-heavy and dynamically authenticated pages instead of silently giving you empty HTML. It also improves token efficiency by stripping noise before conversion, which produces markdown that's much more compact than raw HTML and lowers inference cost on token-priced APIs. On top of that, the official MCP serve
*Source: www.firecrawl.dev*

**Q: How is this different from other HTML-to-markdown tools?**
A: Firecrawl fetches and fully renders the page — including JavaScript-heavy sites — before converting, so you get the actual visible content, not raw HTML source. It also strips ads, navbars, footers, and other noise before conversion, giving you clean markdown instead of cluttered output.
*Source: www.firecrawl.dev*

**Q: What does it mean to scrape a website to markdown?**
A: It means fetching a page's HTML and converting the meaningful content into markdown so headings, links, and code remain structured while navigation, scripts, cookie banners, and other page chrome get removed.
*Source: www.firecrawl.dev*

**Q: Can I download the markdown output?**
A: Yes. After conversion, click Download .md to save the output as a markdown file named after the URL. You can also copy it directly to your clipboard.
*Source: www.firecrawl.dev*

### 🎥 Videos (4)

**Scrape ANY Website With AI For FREE with Firecrawl! Best AI Web ...**
- URL: https://www.youtube.com/watch?v=2s2aR4rOQ8Y
- Duration: 09:00
- Creator: WorldofAI

**🔥 Is this the Best Crawler for LLM-Ready Data | FireCrawl 🔥 ...**
- URL: https://www.youtube.com/watch?v=YZl9f5tcFVY
- Duration: 07:36
- Creator: Prompt Engineer

**Firecrawl: Convert Websites into LLM-Ready Data - YouTube**
- URL: https://www.youtube.com/watch?v=fDSM7chMo5E
- Duration: 04:06
- Creator: Developers Digest

**GitHub - mendableai/firecrawl: 🔥 Turn entire websites into ...**
- URL: https://www.youtube.com/watch?v=hvLFv5X6EyU
- Duration: 01:14
- Creator: GitHub Daily Trend


## competitor_npm — "npm package claude code web fetch cache plugin MCP"

**Meta:** original='npm package claude code web fetch cache plugin MCP'

### 🔎 Web (16 results)

**1. GitHub - zilliztech/claude-context: Code search MCP for Claude Code. Make entire codebase the context for any coding agent. · GitHub**
- URL: https://github.com/zilliztech/claude-context
- # Build all packages (cross-platform) pnpm build # Build specific package pnpm build:core pnpm build:vscode pnpm build:mcp # Performance benchmarking pnpm benchmark · All build scripts are cross-platform compatible using rimraf · Build caching is enabled for faster subsequent builds
  > Check out memsearch Claude Code plugin — a markdown-first memory system that gives your AI agent long-term memory across sessions. Claude Context is an MCP plugin that adds semantic code search to Claude Code and other AI coding agents, giving them deep context from your entire codebase.
  > See the Claude Code MCP documentation for more details about MCP server management.
  > # Build all packages (cross-platform) pnpm build # Build specific package pnpm build:core pnpm build:vscode pnpm build:mcp # Performance benchmarking pnpm benchmark · All build scripts are cross-platform compatible using rimraf · Build caching is enabled for faster subsequent builds
  > 💰 Cost-Effective for Large Codebases: Instead of loading entire directories into Claude for every request, which can be very expensive, Claude Context efficiently stores your codebase in a vector database and only uses related code in context to keep your costs manageable. Model Context Protocol (MCP) allows you to integrate Claude Context with your favorite AI coding assistants, e.g.

**2. Npm MCP Integration with Claude Code | Composio**
- URL: https://composio.dev/toolkits/npm/framework/claude-code
- Search NPM PackagesTool to search for packages in the npm registry. The Npm MCP server is an implementation of the Model Context Protocol that connects your AI agent and assistants like Claude, Cursor, etc directly to your Npm account.
- Age: 2 weeks ago
  > Get NPM Package MetadataTool to fetch metadata for a specified npm package. Get NPM Registry Root MetadataFetches npm registry root metadata including total package count and update sequence. Search NPM PackagesTool to search for packages in the npm registry. The Npm MCP server is an implementation of the Model Context Protocol that connects your AI agent and assistants like Claude, Cursor, etc directly to your Npm account.
  > IntroductionAlso integrate Npm withWhy use Composio?Supported Tools & TriggersWhat is the Npm MCP serverConnecting Npm via Composio SDKStep-by-step GuideComplete CodeConclusionHow to build Npm MCP Agent with another frameworkExplore Other ToolkitsFAQ · We manage OAuth, API Key, token refresh, and scopes, you just build.Try for Free ... Manage your Npm directly from Claude Code with zero worries about OAuth hassles, API-breaking issues, or reliability and security concerns.
  > You can programmatically generate an MCP URL with the app you need (here Npm) for even more tool search precision. It's secure and reliable. ... Discovery: Searches for tools matching your task and returns relevant toolkits with their details. Authentication: Checks for active connections. If missing, creates an auth config and returns a connection URL via Auth Link. Execution: Executes the action using the authenticated connection. ... # macOS, Linux, WSL curl -fsSL https://claude.ai/install.sh
  > After running the command, close the current Claude Code session and start a new one for the changes to take effect. ... Check that your Npm MCP server is properly configured.

**3. r/ClaudeAI on Reddit: Setting Up MCP Servers in Claude Code: A Tech Ritual for the Quietly Desperate**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1jf4hnt/setting_up_mcp_servers_in_claude_code_a_tech/
- claude mcp add fetch -s user -- npx -y u/kazuph/mcp-fetch ... Reddit reformatted your commands like it did to mine. claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking · You need to switch to ...
- Age: March 19, 2025
  > Posted by u/mr_undeadpickle77 - 158 votes and 69 comments
  > claude mcp add fetch -s user -- npx -y u/kazuph/mcp-fetch ... Reddit reformatted your commands like it did to mine. claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking · You need to switch to markdown format then type or paste it in. ... On a similar note, its been a PITA finding the logs. On Windows they're here: %USERPROFILE%/AppData/Local/claude-cli-nodejs/Cache/{project-name}/{mcp-server-name}/
  > # Sequential Thinking — Claude's chain‑of‑thought engine claude mcp add sequential-thinking -s user \ -- npx -y @modelcontextprotocol/server-sequential-thinking || true # Filesystem — give Claude access to local folders claude mcp add filesystem -s user \ -- npx -y @modelcontextprotocol/server-filesystem \ ~/Documents ~/Desktop ~/Downloads ~/Projects || true # Playwright — modern multi‑browser automation claude mcp add playwright -s user \ -- npx -y @playwright/mcp-server || true # Puppeteer — C
  > Not sure if it was an enoding issue or if you upated the npm namespace but it's working with the adjusted command ... Yep, reddit seems to reformat the @ to a u/ unless you type or paste to a post in Reddit's markdown mode. ... so far i installed wsl and tried any mcp.

**4. Fast WebFetch MCP Server for Claude Code**
- URL: https://lobehub.com/mcp/nikketryhard-fast-webfetch-mcp
- -&gt; AI Summary (optional) -&gt; Result | v (failed/unavailable) Direct Fetch + Readability -&gt; AI Summary (optional) -&gt; Result ... # Clone the repo git clone https://github.com/nikketryhard/fast-webfetch-mcp.git ~/fast-webfetch-mcp # Install dependencies cd ~/fast-webfetch-mcp &amp;&amp; bun install # Add MCP server with environment variables claude mcp add fast-webfetch \ -e FIRECRAWL_API_
- Age: March 7, 2026
  > A high-performance MCP server for web fetching in Claude Code using Firecrawl backend with automatic fallback.
  > -> AI Summary (optional) -> Result | v (failed/unavailable) Direct Fetch + Readability -> AI Summary (optional) -> Result ... # Clone the repo git clone https://github.com/nikketryhard/fast-webfetch-mcp.git ~/fast-webfetch-mcp # Install dependencies cd ~/fast-webfetch-mcp && bun install # Add MCP server with environment variables claude mcp add fast-webfetch \ -e FIRECRAWL_API_URL=http://localhost:3002 \ -e FAST_WEBFETCH_API_URL=http://127.0.0.1:8045/v1 \ -e FAST_WEBFETCH_MODEL=gemini-3-flash \ 
  > # Using Docker docker run -p 3002:3002 mendableai/firecrawl # Or use the official Firecrawl MCP claude mcp add firecrawl-mcp -e FIRECRAWL_API_URL=http://localhost:3002 -- npx -y firecrawl-mcp · Without Firecrawl, the server falls back to direct fetch + Readability (no JS rendering).
  > A modern, real-time wallet tracker dashboard for Hyperliquid perpetuals. The MCP server is available as the npm package 'hyperliquid-tracker-mcp'. Configuration data is stored in browser localStorage with a default fallback to 'data/config.json'.

**5. How to Set Up Chrome DevTools MCP for Claude Code | @samwize**
- URL: https://samwize.com/2026/03/26/how-to-set-up-chrome-devtools-mcp-for-claude-code/
- claude plugin marketplace add ChromeDevTools/chrome-devtools-mcp claude plugin install chrome-devtools-mcp · By default, the plugin launches its own Chrome. You don’t want that. You want your real browser with all your tabs and logins. ... vim ~/.claude/plugins/cache/claude-plugins-official/chrome-devtools-mcp/latest/.claude-plugin/plugin.json
- Age: March 26, 2026
  > claude plugin marketplace add ChromeDevTools/chrome-devtools-mcp claude plugin install chrome-devtools-mcp · By default, the plugin launches its own Chrome. You don’t want that. You want your real browser with all your tabs and logins. ... vim ~/.claude/plugins/cache/claude-plugins-official/chrome-devtools-mcp/latest/.claude-plugin/plugin.json
  > The e-paper sits behind an NLB login, rendered in a custom epub reader. No API. No RSS feed. No MCP for SPH’s newspaper platform. Claude Code opened the tab, found the reader’s internal cciobjects.json endpoint, and pulled every article’s headline, byline, and full text in a single fetch.
  > Don’t use claude mcp add. The full plugin gives you the MCP server plus 6 skills (a11y auditing, performance debugging, troubleshooting, etc).
  > claude mcp add chrome-devtools npx chrome-devtools-mcp@latest · This skips the skills. The troubleshooting skill alone would’ve saved me an hour. Use the full plugin.

**6. Claude Code Plugins: From Personal Setup to Org Standard**
- URL: https://claudefa.st/blog/tools/mcp-extensions/plugins-distribution
- The hooks.json uses the same schema as the hooks block in .claude/settings.json, so copy that block verbatim. See the Claude Code hooks guide for the schema details. The .mcp.json file looks identical to the format in the MCP basics guide, with one wrinkle: paths inside the file resolve relative to the plugin&#x27;s cache location, not your project root.
- Age: 19 hours ago
  > A plugin is closer to an npm package: version, manifest, namespace, marketplace, update mechanism. If your thing doesn't need any of that, ship it as a standalone skill and save the manifest. The lifecycle Anthropic documented is straightforward in the abstract and surprisingly difficult in practice. One engineer builds a working personal setup. The harness as it lives in .claude/ on one machine. A stop hook, a custom MCP, three skills.
  > The hooks.json uses the same schema as the hooks block in .claude/settings.json, so copy that block verbatim. See the Claude Code hooks guide for the schema details. The .mcp.json file looks identical to the format in the MCP basics guide, with one wrinkle: paths inside the file resolve relative to the plugin's cache location, not your project root.
  > Skills, hooks, agents, MCP configs all go at the plugin root. The error mode is silent. Forgetting the namespace. Plugin skills are always invoked as /plugin-name:skill-name. If a skill works in .claude/skills/ locally but breaks after packaging, the invocation path changed. Update cross-references in CLAUDE.md and sub-agent definitions. Hard-coding paths. Plugins get copied to ~/.claude/plugins/cache after install.
  > Claude Opus 4.8 is out with browser agent SoTA, 4x fewer code flaws, and a 3x cheaper Fast mode. Read the guide. ... MCP BasicsMCP Tool SearchLSP MCP ServerContext7 MCPExtensions & AddonsShopify MCP & AI ToolkitShopify Dev MCP InstallMeta MCP & CLIMeta MCP ComparisonHiggsfield MCPAI Video ComparisonKlaviyo MCPGoogle Ads MCPCursor MCPSearch ToolsBrowser AutomationSocial Media AutomationCustom IntegrationsPlugins Distribution

**7. Claude Code MCP Servers & Plugins: The Complete | Clarista**
- URL: https://www.clarista.io/blog/claude-code-mcp-plugins-guide
- With MCP, you write the integration once as a server, and any MCP-compliant client (Claude Code, Claude Desktop, Cowork, Cursor experimental) can call it. MCP defines three primary capabilities a server can expose: Resources — read-only data ...
- Age: 2 weeks ago
  > MCP servers and plugins extend Claude Code into your tools. The full guide.
  > Supply chain risk. Community MCP servers come from npm and PyPI. The same supply-chain attacks that hit other ecosystems hit MCP. BYO LLM friction. Most MCP setup assumes Claude API directly.
  > With MCP, you write the integration once as a server, and any MCP-compliant client (Claude Code, Claude Desktop, Cowork, Cursor experimental) can call it. MCP defines three primary capabilities a server can expose: Resources — read-only data the model can fetch (file contents, database rows, API responses).
  > A plugin is the distribution unit above MCP servers. A plugin bundles: ... You install a plugin once, and you get all its capabilities. Plugins can be published to marketplaces — Anthropic's official one, third-party ones, or a private internal marketplace for your team. The CLI command depends on your version of Claude Code.

**8. Claude Code Plugin Marketplace: A Deep Dive**
- URL: https://ice-ice-bear.github.io/posts/2026-04-03-claude-code-plugin-marketplace/
- flowchart TD A[&quot;Developer &lt;br/&gt; Authors Plugin&quot;] --&gt; B[&quot;plugin.json &lt;br/&gt; Manifest&quot;] B --&gt; C[&quot;marketplace.json &lt;br/&gt; Catalog Entry&quot;] C --&gt; D{&quot;Distribution Source&quot;} D --&gt; E[&quot;GitHub &lt;br/&gt; owner/repo&quot;] D --&gt; F[&quot;GitLab &lt;br/&gt; git URL&quot;] D --&gt; G[&quot;npm &lt;br/&gt; package registry&quot;] D --&gt
- Age: April 2, 2026
  > This is not just an extension installer — it is a complete distribution system with centralized discovery, version pinning, automatic updates, permission controls, and support for multiple source backends including GitHub, npm, GitLab, and local paths. This post breaks down every layer of the system from plugin authoring to marketplace distribution and permission management. The plugin system is organized into three tiers: the marketplace catalog, individual plugin sources, and the local cache.
  > Reserved names: The following are blocked for third-party use: claude-code-marketplace, claude-code-plugins, claude-plugins-official, anthropic-marketplace, anthropic-plugins, agent-skills, knowledge-work-plugins, life-sciences. Names that impersonate official marketplaces (like official-claude-plugins) are also blocked. Critical distinction: The marketplace source (where to fetch marketplace.json) and plugin sources (where to fetch individual plugins) are independent concepts.
  > bypassPermissions still prompts for writes to .git, .claude, .vscode, .idea, and .husky to prevent accidental corruption. { "permissions": { "allow": [ "Bash(npm run build)", "Bash(git * main)", "mcp__puppeteer__puppeteer_navigate", "Agent(Explore)", "Read(/src/**)" ], "deny": [ "Agent(Plan)", "Edit(//etc/**)" ] } }
  > flowchart TD A["Developer <br/> Authors Plugin"] --> B["plugin.json <br/> Manifest"] B --> C["marketplace.json <br/> Catalog Entry"] C --> D{"Distribution Source"} D --> E["GitHub <br/> owner/repo"] D --> F["GitLab <br/> git URL"] D --> G["npm <br/> package registry"] D --> H["Relative Path <br/> ./plugins/..."] E --> I["End User"] F --> I G --> I H --> I I --> J["<br/>/plugin marketplace add<br/>Register Catalog"] J --> K["<br/>/plugin install<br/>Install Plugin"] K --> L["~/.claude/plugins/cac

**9. @henkisdabro/mcp-selector - npm**
- URL: https://www.npmjs.com/package/@henkisdabro/mcp-selector
- # Enable/disable specific servers mcp enable fetch github # Enable multiple servers mcp disable notion playwright # Disable multiple servers # Bulk operations mcp enable --all # Enable all discovered servers mcp disable --all # Disable all discovered servers # Machine-readable output mcp enable fetch --json # Output JSON result mcp disable fetch --quiet # Silent operation (exit code only) ... # Li
- Age: January 30, 2026
  > # Enable/disable specific servers mcp enable fetch github # Enable multiple servers mcp disable notion playwright # Disable multiple servers # Bulk operations mcp enable --all # Enable all discovered servers mcp disable --all # Disable all discovered servers # Machine-readable output mcp enable fetch --json # Output JSON result mcp disable fetch --quiet # Silent operation (exit code only) ... # List available plugins not yet installed mcp list-available # Show all uninstalled plugins mcp list-av
  > User scope: fetch defined with default args + enabled Project scope: fetch defined with custom args + disabled Result: Uses project definition (custom args) + disabled state Display: [OFF] fetch (project, mcpjson) For Direct servers (defined in ~/.claude.json), pressing ALT-M offers to migrate the server to ./.mcp.json:
  > This tool is designed primarily for individual developers and teams managing their own MCP server configurations. ... This fetches the latest version each time (with caching for performance).
  > Enable only the 2-3 MCP servers you need for your next task (e.g., if working with web APIs, enable fetch; if debugging time zones, enable time) Press ENTER - tool saves changes and launches Claude automatically

**10. Claude Custom Fetch MCP | MCP Servers**
- URL: https://lobehub.com/mcp/lyshrines-claude-custom-fetch-mcp
- { &quot;mcpServers&quot;: { &quot;custom-fetch&quot;: { &quot;command&quot;: &quot;python&quot;, &quot;args&quot;: [&quot;-m&quot;, &quot;mcp_fetch.server&quot;], &quot;env&quot;: { &quot;PYTHONPATH&quot;: &quot;/path/to/claude-custom-fetch-mcp&quot;, &quot;USERPROFILE&quot;: &quot;C:\\Users\\YourName&quot;, &quot;CACHE_TTL&quot;: &quot;3600&quot;, &quot;MAX_CACHE_SIZE_MB&quot;: &quot;100&quot;, &
- Age: March 25, 2026
  > Chrome MCP Server 是一个基于 Chrome 扩展的模型上下文协议（MCP）服务器，能够将您的 Chrome 浏览器功能暴露给像 Claude 这样的 AI 助手，实现复杂的浏览器自动化、内容分析和语义搜索。需要安装 Chrome 扩展和全局安装 mcp-chrome-bridge npm 包。 ... This server can only run on the client's local device, requiring installation and relying on local resources. ... Read https://lobehub.com/mcp/lyshrines-claude-custom-fetch-mcp/skill.md and follow the instructions to setup LobeHub MCP Marketplace and install the MCP server.
  > An MCP server providing web scraping capabilities for Claude Code users using third-party APIs. It performs local HTTP requests to fetch web pages without relying on any API provider.
  > 本 MCP 服务器在本地发起 HTTP 请求抓取网页，不依赖任何 API 提供商，只要你的电脑能上网就能工作。 · 网页抓取：抓取网页并提取正文内容（去除广告、导航等干扰元素） · 智能缓存：基于 SQLite 的本地缓存，避免重复请求（默认 1 小时过期） · API 检测：自动检测当前 Claude Code 的 API 配置 ... git clone https://github.com/lyshrines/claude-custom-fetch-mcp cd claude-custom-fetch-mcp pip install -r requirements.txt pip install truststore
  ```json
  { "mcpServers": { "custom-fetch": { "command": "python", "args": ["-m", "mcp_fetch.server"], "env": { "PYTHONPATH": "/path/to/claude-custom-fetch-mcp", "USERPROFILE": "C:\\Users\\YourName", "CACHE_TTL": "3600", "MAX_CACHE_SIZE_MB": "100", "LOG_LEVEL": "INFO" } } } }
  ```

### 💬 Discussions (10)

**1. Setting Up MCP Servers in Claude Code: A Tech Ritual for the Quietly Desperate**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1jf4hnt/setting_up_mcp_servers_in_claude_code_a_tech/
- Took me about 30 min to figure this out, but Claude stores the GLOBAL MCP servers in a top level `mcpServers` property inside the `/Users/USERNAME/.claude.json`. I have no idea why they don't mention this in their docs, but I hope people find it when looking for this.

**2. My Claude Workflow Guide: Advanced Setup with MCP External Tools**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1ji8ruv/my_claude_workflow_guide_advanced_setup_with_mcp/
- Great tutorial!

**3. I built an MCP server for npm with built-in analysis & security—works in Claude, Cursor, Windsurf, VS Code**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1mlpgjk/i_built_an_mcp_server_for_npm_with_builtin/
- I like the idea, I was just looking for something like that, but that repo is mess: https://github.com/shacharsol/js-package-manager-mcp/tree/main/src/models

**4. Claude codeoverview on npm is the most phenomenal thing in AI yet**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1kd1jq1/claude_codeoverview_on_npm_is_the_most_phenomenal/
- Did you use AI to write this post? First, there's no such thing as "codeoverview". It's just called "Claude Code". The npm package is @anthropic-ai/claude-code. The page you linked to is an overview of the Claude Code app. Second, it's not nearly as world -changing as you describe. It does what othe

**5. Claude App won't quit anywhere that it's installed. Need to force close every time.**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1pywh6g/claude_app_wont_quit_anywhere_that_its_installed/
- Yes, constantly - really annoying.  Claude on MacOS just gets 'stuck' in the background and needs force quitting.

### ❓ FAQ (4)

**Q: What are the differences in Tool Router MCP and Npm MCP?**
A: With a standalone Npm MCP server, the agents and LLMs can only access a fixed set of Npm tools tied to that server. However, with the Composio Tool Router, agents can dynamically load tools from Npm and many other apps based on the task at hand, all through a single MCP endpoint.
*Source: composio.dev*

**Q: Can I use Tool Router MCP with Claude Code?**
A: Yes, you can. Claude Code fully supports MCP integration. You get structured tool calling, message history handling, and model orchestration while Tool Router takes care of discovering and serving the right Npm tools.
*Source: composio.dev*

**Q: Can I manage the permissions and scopes for Npm while using Tool Router?**
A: Yes, absolutely. You can configure which Npm scopes and actions are allowed when connecting your account to Composio. You can also bring your own OAuth credentials or API configuration so you keep full control over what the agent can do.
*Source: composio.dev*

**Q: How safe is my data with Composio Tool Router?**
A: All sensitive data such as tokens, keys, and configuration is fully encrypted at rest and in transit. Composio is SOC 2 Type 2 compliant and follows strict security practices so your Npm data and credentials are handled as safely as possible.
*Source: composio.dev*

### 🎥 Videos (6)

**Inside the Claude Code leak Anthropic accidentally included ...**
- URL: https://www.instagram.com/reel/DWphZjFiOSP/

**So Claude Code's Source Code Was Just Leaked... - YouTube**
- URL: https://www.youtube.com/watch?v=ESwH-_xFS_M
- Duration: 29:17
- Creator: ForrestKnight

**Claude Code's Source Code Leaked! (Let’s Have Fun With It!) - ...**
- URL: https://www.youtube.com/watch?v=dDNH-3D8fQ8
- Duration: 01:20
- Creator: CSS Weekly

**Claude Code's Source Code just went Open-Source when a ...**
- URL: https://www.instagram.com/reel/DWjQJxcE3R6/

**How To Migrate Claude Code From npm to Native Installer - YouTube**
- URL: https://www.youtube.com/watch?v=Gyh_ox9C1cI
- Duration: 08:26
- Creator: Mike Murphy | AI Handyman


## prompt_vs_content_cache — "prompt caching vs content caching AI agents difference"

**Meta:** original='prompt caching vs content caching AI agents difference'

### 🔎 Web (18 results)

**1. Don’t Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks**
- URL: https://arxiv.org/html/2601.06007v1
- A cache miss occurs when any token differs from the cached content, even at the very beginning (shown with an orange indicator), forcing complete recomputation of all tokens (shown in gray). Figure 4: Prompt caching requires exact prefix matches. Different shades represent message types in agentic conversations: brightest (system prompt), light gray (human messages), medium gray (AI ...
- Age: January 9, 2026
  > A cache miss occurs when any token differs from the cached content, even at the very beginning (shown with an orange indicator), forcing complete recomputation of all tokens (shown in gray). Figure 4: Prompt caching requires exact prefix matches. Different shades represent message types in agentic conversations: brightest (system prompt), light gray (human messages), medium gray (AI messages), darker gray (tool calls), and darkest (tool results).
  > The emerging pattern for agentic applications is to maintain a large, stable system prompt that benefits from caching, while treating tool calls and results as dynamic content that may be summarized, pruned, or otherwise managed throughout the session. Provider implementations of prompt caching differ in important ways that affect practical deployment.
  > Y. Cheng, K. Du, J. Yao, and J. Jiang (2024) Do large language models need a content delivery network?. arXiv preprint arXiv:2409.13761. Cited by: §5.3. Y. Cheng, Y. Liu, J. Yao, Y. An, X. Chen, S. Feng, Y. Huang, S. Shen, K. Du, and J. Jiang (2025) LMCache: an efficient kv cache layer for enterprise-scale llm inference. arXiv preprint arXiv:2510.09665. Cited by: §5.3. CrewAI (2023) CrewAI: framework for orchestrating collaborative, autonomous ai agents.
  > As agentic systems continue to trend toward longer-running sessions with dozens of tool calls, strategic prompt caching becomes critical for reducing operational costs and improving user experience, and our findings provide practitioners with guidance for implementing prompt caching in production agentic systems. Agno (2026) Agno: framework for building ai agents and agentic workflows.

**2. Prompt caching vs semantic caching: How to make AI agents faster**
- URL: https://redis.io/blog/prompt-caching-vs-semantic-caching/
- Prompt caching reuses identical prompt prefixes to cut token work, while semantic caching uses embedding-based similarity to reuse responses across meaningfully similar queries—improving cost, latency, and scalability with different TTLs, ...
- Age: December 8, 2025
  > Use cases: Summarizing documents, multi-turn conversations with fixed prompts, or workflows requiring repeated processing of the same large context. ... Semantic caching is matching data based on semantic meaning rather than exact key-value lookups. In AI agent workflows, this allows storing past query–answer pairs and reusing them when a new query is semantically similar, avoiding another LLM call. Sometimes two queries look different but mean the same thing.
  > Prompt caching reuses identical prompt prefixes to cut token work, while semantic caching uses embedding-based similarity to reuse responses across meaningfully similar queries—improving cost, latency, and scalability with different TTLs, complexity, and use-case profiles. For complex AI systems, the best approach is often double caching: Prompt caching handles repeated large contexts. Semantic caching handles repeated queries with similar meanings. Example: A customer support agent analyzing a 
  > Learn how prompt caching and semantic caching work, when to use each, and how Redis LangCache speeds up AI agents while cutting LLM costs.
  > At Redis, we believe caching isn’t just a nice-to-have but it’s a critical technique for building high-performance, cost-efficient AI agents. In this post, we’ll explain two key caching approaches: prompt caching and semantic caching, and show how they can turbocharge your AI workflows.

**3. Faster Agents with Automatic Prompt Caching | Heroku**
- URL: https://www.heroku.com/blog/faster-agents-automatic-prompt-caching/
- Prompt caching is an optimization that speeds up inference by securely caching and reusing the processed components of your requests for system prompts and tool definitions. For applications involving agents, a large portion of the request remains ...
- Age: December 4, 2025
  > Prompt caching is an optimization that speeds up inference by securely caching and reusing the processed components of your requests for system prompts and tool definitions. For applications involving agents, a large portion of the request remains static. Instead of reprocessing this content on every call, Heroku can now reuse the processed result from a secure cache. Currently, to simplify billing, we do not charge for cache writes or pass on the difference for cache hits as we evaluate the sys
  > This mechanism applies to all supported models, but caching only occurs when content meets the minimum token threshold, focusing performance gains where they add the most value. Caching behavior is model-specific, as different models have different thresholds and capabilities (such as caching tool definitions). Privacy and Security is fundamental to Heroku Managed Inference and Agents. Our prompt caching feature is built on proven security infrastructure, protecting your data with enterprise-gra
  > Optimize your AI Agents on Heroku. New automatic prompt caching reuses processed system prompts to deliver significantly faster responses. No config needed.
  > Prompt caching is another step in making Heroku Managed Inference and Agents easy, secure, and efficient for building AI applications.

**4. Prompt Caching and Context Optimization in Coding Agents**
- URL: https://susheemk.substack.com/p/prompt-caching-and-context-optimization
- A high-level workflow diagram showing how Turn 1 vs Turn 2 to N of a session looks like with Prompt Caching Enabled. Notice that the full pre-fill is done once on T1 while T2…N leverage cache plus incremental Transformer Runs · Most of the LLM providers are implicitly optimizing for this compute overhead. This structural optimization makes long-context interactions financially viable for tool buil
- Age: 1 month ago
  > Screenshot from my Cursor Dashboard showing close to 99% of input tokens picked from Cache. Thank you LLM Gods :) Agentic coding tools pass massive amounts of context to language models—system instructions, workspace rules, file contents, and conversation history. Since LLMs are inherently stateless, they normally process this entire payload from scratch on every single request. Prompt caching is a mechanism that saves the intermediate computations—specifically the output of the transformer stag
  > While LLM providers generally charge more for output token generation, the sheer size of the input context that modern day AI Coding Agents are providing makes it worthwhile to consider any possible cost saving on the input stage as well. When you ask a follow-up question in the same session, the system instructions, project rules, and file context remain identical. The prefix matches. Instead of recalculating the entire attention matrix from scratch, the model hits the cache for the bulk of the
  > A high-level workflow diagram showing how Turn 1 vs Turn 2 to N of a session looks like with Prompt Caching Enabled. Notice that the full pre-fill is done once on T1 while T2…N leverage cache plus incremental Transformer Runs · Most of the LLM providers are implicitly optimizing for this compute overhead. This structural optimization makes long-context interactions financially viable for tool builders and noticeably faster for users, drastically reducing the time to first token on heavy requests
  > Prompt caching is just one part of the cost optimization playbook. Instead of stuffing every file into the context window and hoping for a cache hit, coding agents also need ways to selectively retrieve only the most relevant code.

**5. Prompt Caching Explained: What It Is, What It Isn’t, and When to Use It**
- URL: https://medium.com/@michael.hannecke/prompt-caching-explained-what-it-is-what-it-isnt-and-when-to-use-it-9f5c6fce7bdb
- The agent’s reasoning changes. The scaffolding does not. Caching the stable parts cuts per-step costs dramatically. Batch processing. Same instructions, varying inputs. Think: “Classify these 10,000 support tickets.” The classification prompt is identical. Only the ticket content changes.
- Age: February 11, 2026
  > The highest-ROI optimization most LLM teams still overlook
  > Prompt Caching: 10x Cheaper LLM Tokens, But How? (ngrok Blog, Dec 2025) ... This article reflects my professional perspective. AI assistance was used in drafting; insights and final curation are entirely my own. Sovereign AI Strategist @ bluetuple.ai | Exploring autonomous AI systems, agentic architectures, and secure AI independence.
  > The agent’s reasoning changes. The scaffolding does not. Caching the stable parts cuts per-step costs dramatically. Batch processing. Same instructions, varying inputs. Think: “Classify these 10,000 support tickets.” The classification prompt is identical. Only the ticket content changes.
  > Your system prompt and conversation history grow with every turn. Caching ensures the model only processes the latest message from scratch. Everything before it rides the cache. Document Q&A and RAG. You inject the same reference documents into every request. Different users ask different questions about the same corpus. The documents get cached. Only the questions get recomputed. Agentic workflows.

**6. Amazon Bedrock Prompt Caching: Saving Time and Money in LLM Applications | Caylent**
- URL: https://caylent.com/blog/prompt-caching-saving-time-and-money-in-llm-applications
- Decreased latency: By avoiding redundant processing of identical prompt segments, response times can improve dramatically. Amazon Bedrock reports up to 85% faster responses for cached content on supported models. For interactive applications like chatbots, this can mean the difference between a fluid conversation and a frustratingly laggy experience. And if you&#x27;re building agentic application
  > Decreased latency: By avoiding redundant processing of identical prompt segments, response times can improve dramatically. Amazon Bedrock reports up to 85% faster responses for cached content on supported models. For interactive applications like chatbots, this can mean the difference between a fluid conversation and a frustratingly laggy experience. And if you're building agentic applications where the model might make multiple API calls in sequence, that latency reduction compounds with each s
  > Caylent Launches Dedicated Anthropic Practice to Lead Enterprise AI Transformation ... Explore how to use prompt caching on Large Language Models (LLMs) such as Amazon Bedrock and Anthropic Claude to reduce costs and improve latency.
  > Bedrock Agents: If you're using Amazon Bedrock Agents for higher-level task orchestration, you can simply turn on prompt caching when creating or updating an agent. The agent will then automatically handle caching behavior without additional coding. With Claude models you can use simplified cache management, where you simply place one checkpoint at the end of static content, and Bedrock automatically checks for cache hits at previous content-block boundaries.
  > Prompt caching provides substantial benefits for applications requiring consistent, repeated context across multiple interactions. This include: Conversational agents: where system instructions or user-specific context can be reused across turns to maintain flow and reduce cost. Coding assistants and large document processing systems: allowing models to efficiently query and analyze extensive information without re-reading the full content for each interaction.

**7. What Is Prompt Caching? LLM Speed & Cost Guide**
- URL: https://redis.io/blog/what-is-prompt-caching/
- That makes semantic caching generally more cost-effective for workloads where users ask similar questions in different ways, while prompt caching helps more with genuinely novel queries that share a long prefix.
- Age: March 11, 2026
  > That makes semantic caching generally more cost-effective for workloads where users ask similar questions in different ways, while prompt caching helps more with genuinely novel queries that share a long prefix. Redis supports both exact-match and semantic caching with vector search, so you can run all three layers from a single platform. Because prompt caching relies on prefix matching, it works best when you structure prompts with stable content first and variable content last.
  > This is especially valuable in long conversations, where session costs can vary widely depending on cache hit rate and token usage. In long-horizon agentic systems, the system prompt is typically where teams see the most consistent caching benefits because it's both large and stable.
  > Optional parameters like prompt_cache_retention (for extended 24-hour caching) and prompt_cache_key (for routing control) are available for optimization. Google supports context caching through both the Gemini Developer API (Google AI Studio) and Vertex AI, with implicit caching enabled by default on Gemini 2.5 models.
  > This guide covers how prompt caching works at the model layer, how it differs from regular and semantic caching, where each approach fits in your architecture, and how to combine them with Redis for maximum cost and latency reduction.

**8. r/AI_Agents on Reddit: Why Aren't We Talking About Caching "System Prompts" in LLM Workflows?**
- URL: https://www.reddit.com/r/AI_Agents/comments/1jsem9f/why_arent_we_talking_about_caching_system_prompts/
- Anthropic&#x27;s prompt caching has a lifetime of 5-minutes. OpenAI docs don&#x27;t state the exact time, but it&#x27;s in the same ballpark as Anthropic (less during peak hours). ... The cache has a minimum lifetime (TTL) of 5 minutes.
- Age: April 5, 2025
  > When triggering a simple LLM agent, we usually send a long, static system message with every call. It includes formatting rules, product descriptions, few-shot examples, etc. This payload doesn't change between sessions or users, and it's resent to the LLM every time a new user triggers the workflow. For CAG workflows, it's even worse. Those "system prompts" can get really hefty. Is there any way — at the LLM or framework level — to cache or persist the system prompt so that only the user input 
  > However, what you should do is to cache "at source" - what I mean by that is that you should be managing state within your application and adjust the system prompts to match the relevant situation (e.g. don't send out ABCD if only A and B applies at any particular point). Agents SDK supports this natively (but pretty much any decent framework does too) - https://openai.github.io/openai-agents-python/agents/#dynamic-instructions
  > Longer caching time = lesser profit for llm providers. Therefore, probably not a priority for them. ... by assigning a primary directive to an agent we set them up with what they need to do and then this primary directive is inserted into a system prompt so you as a user only have to worry about handling the user side prompt as this system prompt is automatically inserted into the messages array if there is no attached system prompt
  > Anthropic's prompt caching has a lifetime of 5-minutes. OpenAI docs don't state the exact time, but it's in the same ballpark as Anthropic (less during peak hours). ... The cache has a minimum lifetime (TTL) of 5 minutes. This lifetime is refreshed each time the cached content is used.

**9. Prompt caching for lower AI cost and latency**
- URL: https://www.parloa.com/knowledge-hub/prompt-caching/
- Contact center AI agents are a strong fit for prompt caching because most interactions reuse the same prompt structure. Effective caching depends on placing static content at the beginning of the prompt and dynamic content at the end.
- Age: April 6, 2026
  > Prompt caching is not a one-time optimization; it must be governed across the entire AI agent lifecycle. Cache hit rates depend on prompt structure remaining stable over time, which means every change to system prompts, tool definitions, compliance rules, or knowledge base content has the potential to silently break caching and inflate costs.
  > Learn how prompt caching reduces AI inference cost and latency for enterprise contact centers handling millions of interactions.
  > The following table breaks down a typical contact center prompt into its cached and non-cached zones, showing where each content type falls and how caching applies: ... prompt engineering frameworks, where disciplined prompt architecture supports both agent quality and infrastructure efficiency.
  > Multi-language deployments add another layer of caching complexity. ... Berlin-Brandenburg Airport's AI agent handles passenger inquiries around the clock in German, English, Polish, and Spanish. Each language requires its own system prompt, brand guidelines, and compliance rules, creating separate cache prefixes per language.

**10. Prompt Caching Explained Like You're Talking to a Smart Human (Not an AI Researcher) - DEV Community**
- URL: https://dev.to/anandindia93/prompt-caching-explained-like-youre-talking-to-a-smart-human-not-an-ai-researcher-26gf
- As an SRE, imagine building an AI incident assistant. ... - Kubernetes topology - Loki queries - Grafana dashboards - Service dependencies - Runbooks - Deployment metadata ... People confuse these two constantly. ... They are completely different systems. ... Prompt caching becomes exponentially valuable as context windows grow.
- Age: 1 week ago
  > If you've started using AI APIs for coding assistants, chatbots, agents, RAG systems, or internal... Tagged with ai, llm, performance, tutorial.
  > As an SRE, imagine building an AI incident assistant. ... - Kubernetes topology - Loki queries - Grafana dashboards - Service dependencies - Runbooks - Deployment metadata ... People confuse these two constantly. ... They are completely different systems. ... Prompt caching becomes exponentially valuable as context windows grow.
  > That is essentially prompt caching. Suppose your AI coding assistant sends this every request:
  > Prompt caching sounds like a small optimization feature. It isn’t. It is one of the foundational techniques making modern AI systems: ... Without it, many long-context AI applications would become economically impractical very quickly. ... The bigger your context becomes, the more prompt caching stops being “nice to have” and becomes essential infrastructure.

### 💬 Discussions (10)

**1. Why Aren't We Talking About Caching "System Prompts" in LLM Workflows?**
- URL: https://www.reddit.com/r/AI_Agents/comments/1jsem9f/why_arent_we_talking_about_caching_system_prompts/
- because this is not going to be resolved by any framework. it needs to happen at the vendor level/ before the api call, which is already whats happening - openai and anthropic already implemented ‘prompt caching’ where the ‘system prompts’ are kv cached to improve token cost, latency for repeated ap

**2. How Prompt Caching Works: A Deep Dive into Optimizing AI Efficiency**
- URL: https://www.reddit.com/r/OpenAI/comments/1g5r377/how_prompt_caching_works_a_deep_dive_into/
- Interesting... Theoretically, could they create a super large intelligent model that is way too expensive to give to the public and too costly to run long term, but then perform and cache enough queries on it to create a cheap model that has this super models abilities?

**3. how to save 90% on ai costs with prompt caching? need real implementation advice**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1oawd9c/how_to_save_90_on_ai_costs_with_prompt_caching/
- are you doing a vectorization of the prompt? There is so much nuance that I am skeptical that short of having tens or hundreds of millions of requests you would rarely get a cache hit

**4. What’s the best way to handle memory with AI agents?**
- URL: https://www.reddit.com/r/AI_Agents/comments/1i2wbp3/whats_the_best_way_to_handle_memory_with_ai_agents/
- Using vector database like Chroma, Pinecone or Langchain for conversational agents.

**5. Prompt caching with Claude**
- URL: https://www.reddit.com/r/OpenAI/comments/1es5ovf/prompt_caching_with_claude/
- <blockquote>     <p>     With prompt caching, customers can provide Claude with more background knowledge and example outputs—all while reducing costs by up to 90% and latency by up to 85% for long prompts.   </p>   </blockquote>

### 🎥 Videos (5)

**Spring AI Prompt Caching: Stop Wasting Money on Repeated Tokens ...**
- URL: https://www.youtube.com/watch?v=eYb7BKW4QcU
- Duration: 17:39
- Creator: Dan Vega

**What is Prompt Caching? Optimize LLM Latency with AI Transformers ...**
- URL: https://www.youtube.com/watch?v=u57EnkQaUTY
- Duration: 09:06
- Creator: IBM Technology

**Prompt caching guide (non-technical) - YouTube**
- URL: https://www.youtube.com/watch?v=RDjaUJz-uWo
- Duration: 09:50
- Creator: Dan Cleary

**Let's Speed up LOCAL AI, OpenClaw & Coding Agents | Batched Caching ...**
- URL: https://www.youtube.com/watch?v=O_pQG6x9dvY
- Duration: 12:45
- Creator: xCreate

**Build Hour: Prompt Caching - YouTube**
- URL: https://www.youtube.com/watch?v=tECAkJAI_Vk
- Duration: 56:04
- Creator: OpenAI


## webcache_demand — "claude-webcache npm claude code cache plugin adoption downloads"

**Meta:** original='claude-webcache npm claude code cache plugin adoption downloads'

### 🔎 Web (17 results)

**1. claude-code/CHANGELOG.md at main · anthropics/claude-code**
- URL: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- - Added `skipLfs` option to `github`/`git` plugin marketplace sources to skip Git LFS downloads during clone and update · - Claude Code now shows a one-time notice when your npm global install can&#x27;t auto-update; `/doctor` lists the fixes
- Age: 3 weeks ago
  > Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands. - claude-code/CHANGELOG.md at main · anthropics/claude-code
  > - Fixed MCP stdio servers receiving corrupted arguments when `CLAUDE_CODE_SHELL_PREFIX` is set and an argument contains spaces or shell metacharacters · - Fixed sub-agent progress summaries missing the prompt cache (~3× `cache_creation` reduction) - Fixed `/plugin update` never detecting new versions of npm-sourced plugins
  > - Added `skipLfs` option to `github`/`git` plugin marketplace sources to skip Git LFS downloads during clone and update · - Claude Code now shows a one-time notice when your npm global install can't auto-update; `/doctor` lists the fixes
  > - Fixed plugins enabled in your own settings showing "not cached" errors after first load on a fresh machine; plugins enabled only by a project's `.claude/settings.json` now show an actionable `claude plugin install` hint

**2. GitHub - cnighswonger/claude-code-cache-fix: Fixes prompt cache regression in Claude Code that causes up to 20x cost increase on resumed ses**
- URL: https://github.com/cnighswonger/claude-code-cache-fix
- It sits between Claude Code and the Anthropic API, applying cache fixes as hot-reloadable extensions. # Install npm install -g claude-code-cache-fix # Start the proxy (runs on localhost:9801) node &quot;$(npm root -g)/claude-code-cache-fix/proxy/server.mjs&quot; &amp; # Launch Claude Code through it ANTHROPIC_BASE_URL=http://127.0.0.1:9801 claude
- Age: 2 days ago
  > It sits between Claude Code and the Anthropic API, applying cache fixes as hot-reloadable extensions. # Install npm install -g claude-code-cache-fix # Start the proxy (runs on localhost:9801) node "$(npm root -g)/claude-code-cache-fix/proxy/server.mjs" & # Launch Claude Code through it ANTHROPIC_BASE_URL=http://127.0.0.1:9801 claude
  > All telemetry is written to local files under ~/.claude/. No data leaves your machine. Supply chain: Proxy mode: 7 small extension modules in proxy/extensions/ (each under 200 lines). Preload mode: single unminified file (preload.mjs, ~1,700 lines). One dev dependency (zod for schema validation in tests only). Review before installing. Published builds carry npm's default registry signatures; sigstore provenance attestation is not currently published — tracked as a follow-up.
  > (Proxy-mode users can inspect the deltas in ~/.claude/quota-status/ files, which the proxy writes directly from response headers.) Workaround until upstream fix: use these commands sparingly in long sessions. If you need them frequently in a session, consider /compact after a diagnostic run to reset the bleed. If you're on a Node.js-based CC version (v2.1.112 or earlier), the preload interceptor works without a proxy: npm install -g claude-code-cache-fix NODE_OPTIONS="--import claude-code-cache-
  > @fgrosswig — claude-usage-dashboard forensic methodology: cost-factor overhead ratio metric, anthropic-* header capture pattern, proxy NDJSON schema that informed our dashboard interop layer · @TomTheMenace — Windows .bat wrapper, first Windows platform validation (7.5h/536-call Opus 4.6 session, 98.4% cache hit rate) @arjansingh — nvm-compatible wrapper script with dynamic npm root -g path resolution (PR #15)

**3. Releases · anthropics/claude-code**
- URL: https://github.com/anthropics/claude-code/releases
- Added skipLfs option to github/git plugin marketplace sources to skip Git LFS downloads during clone and update · Claude Code now shows a one-time notice when your npm global install can&#x27;t auto-update; /doctor lists the fixes
- Age: 5 hours ago
  > Added skipLfs option to github/git plugin marketplace sources to skip Git LFS downloads during clone and update · Claude Code now shows a one-time notice when your npm global install can't auto-update; /doctor lists the fixes
  > Fixed /insights crashing when cached session-meta files are missing optional fields · Fixed malformed PowerShell and History tool calls with missing input being misclassified as reads in transcript collapsing · Fixed renaming a Remote Control session from claude.ai or the Claude mobile app not updating the local session name for claude --resume
  > Claude in Chrome: pick which connected browser to use via /chrome → "Select browser…", or in-chat when a browser action runs with multiple connected · Plugins can now declare defaultEnabled: false in plugin.json or a marketplace entry; enable them with /plugin or claude plugin enable.
  > The /plugin Discover tab now pins plugins whose relevance signals match the current directory with a "suggested for this directory" annotation · Streaming tool execution is now always enabled, including when telemetry is disabled or on Bedrock/Vertex/Foundry (previously behind a feature flag) Stdio MCP server subprocesses now receive CLAUDE_CODE_SESSION_ID and CLAUDECODE=1 in their environment

**4. Marketplace-backed npm plugin install/update can use stale local cache instead of current marketplace version · Issue #37670 · anthropics/cl**
- URL: https://github.com/anthropics/claude-code/issues/37670
- A marketplace added from a newer source URL should not continue resolving an older cached plugin package version. Claude continues to install an older cached plugin version until local plugin caches under ~/.claude/plugins are manually removed.
- Age: March 23, 2026
  > Summary Claude Code can install or update a stale npm-backed plugin version from a marketplace even when the marketplace metadata, npm package version, and npm dist-tags all point to a newer version. In my case, a marketplace entry point...
  > Marketplace-backed npm plugin install/update can use stale local cache instead of current marketplace version#37670 ... area:pluginsbugSomething isn't workingSomething isn't workinghas reproHas detailed reproduction stepsHas detailed reproduction stepsplatform:macosIssue specifically occurs on macOSIssue specifically occurs on macOSstaleIssue is inactiveIssue is inactive ... Claude Code can install or update a stale npm-backed plugin version from a marketplace even when the marketplace metadata,
  > In my case, a marketplace entry pointed to a newer prerelease plugin version, but claude plugin install / claude plugin update kept installing an older prerelease until I manually deleted local plugin cache directories under ~/.claude/plugins.
  > A marketplace added from a newer source URL should not continue resolving an older cached plugin package version. Claude continues to install an older cached plugin version until local plugin caches under ~/.claude/plugins are manually removed.

**5. GitHub - ArkNill/claude-code-hidden-problem-analysis: Measured analysis of Claude Code cache bugs causing 10-20x token inflation on Max plan**
- URL: https://github.com/ArkNill/claude-code-cache-analysis
- Update to v2.1.91+ (cap at v2.1.109 — see 4.7 advisory) — fixes the cache regression (worst drain). v2.1.92–109 add no bug fixes for issues tracked here but are safe to use. Do not upgrade to v2.1.110+ (Opus 4.7 risks) npm or standalone — both fine on v2.1.91 (Sentinel gap closed)
- Age: April 1, 2026
  > See 09_QUICKSTART.md for the full list of behaviors to avoid and adopt, including /branch, /release-notes, and environment variable recommendations. On April 1, 2026, my Max 20 plan ($200/mo) hit 100% usage in ~70 minutes during normal coding. JSONL analysis showed the session averaging 36.1% cache read (min 21.1%) where it should have been 90%+. Every token was being billed at full price.
  > Update to v2.1.91+ (cap at v2.1.109 — see 4.7 advisory) — fixes the cache regression (worst drain). v2.1.92–109 add no bug fixes for issues tracked here but are safe to use. Do not upgrade to v2.1.110+ (Opus 4.7 risks) npm or standalone — both fine on v2.1.91 (Sentinel gap closed)
  > Opus 4.7 advisory: 2.4x Q5h burn, model pin bypass, cache metering, long-context retrieval regression, autocompact ~195K, xhigh regression. §2.8 sycophancy (#45502), §2.9 tunnel-vision cluster, §2.10 perception-gap footnote ... All 11 bugs (B1-B11, B2a, B8a) + 3 preliminary + changelog cross-reference through v2.1.140 + new tracked regression #58424 ... Quick fix guide — Option A (v2.1.91+) vs Option B (v2.1.63 downgrade), npm vs standalone, diagnosis
  > TL;DR: Claude Code has 11 confirmed client-side bugs (B1-B5, B8, B8a, B9, B10, B11, B2a) plus 3 preliminary findings (P1-P3). Cache bugs (B1-B2) are fixed in v2.1.91. Six remain unfixed as of v2.1.140 (latest): B3, B4, B5, B8, B9, B10. B8a received a symptom mitigation (v2.1.121).

**6. Plugin cache grows indefinitely without automatic cleanup · Issue #16453 · anthropics/claude-code**
- URL: https://github.com/anthropics/claude-code/issues/16453
- Each time Claude Code resolves plugins from a marketplace (e.g., claude-plugins-official), it caches the plugin at the resolved git commit hash:
- Age: January 6, 2026
  > Description The plugin cache at ~/.claude/plugins/cache/ grows indefinitely as new versions of plugins are cached. There's no automatic garbage collection or TTL-based eviction, causing the cache to accumulate stale entries over time. Ob...
  > ~/.claude/plugins/cache/claude-plugins-official/ ├── frontend-design/ │ ├── unknown/ # Jan 3 (initial, no version) │ ├── 6d3752c000e2/ # Jan 5 │ └── 15b07b46dab3/ # Jan 5 ├── ralph-wiggum/ │ ├── unknown/ # Jan 3 │ ├── 6d3752c000e2/ # Jan 5 │ ├── 15b07b46dab3/ # Jan 6 │ └── dbc4a7733cd4/ # Jan 6 ...
  > Each time Claude Code resolves plugins from a marketplace (e.g., claude-plugins-official), it caches the plugin at the resolved git commit hash:

**7. [BUG] Local plugin cache not invalidated when source files change · Issue #28492 · anthropics/claude-code**
- URL: https://github.com/anthropics/claude-code/issues/28492
- For local plugins (those loaded from ~/.claude/my-plugins/ or similar local paths), invalidate the cache when source file modification timestamps are newer than the cached copies.
- Age: February 25, 2026
  > Preflight Checklist I have searched existing issues and this hasn't been reported yet This is a single bug report (please file separate reports for different bugs) I am using the latest version of Claude Code What's Wrong? Summary Claude...
  > Claude Code caches local plugin files under ~/.claude/plugins/cache/ keyed by plugin name and version.
  > The command still runs the old content ("Hello v1"). The cached copy at ~/.claude/plugins/cache/local-plugins/{name}/0.1.0/commands/my-command.md is served instead of the source file.
  > For local plugins (those loaded from ~/.claude/my-plugins/ or similar local paths), invalidate the cache when source file modification timestamps are newer than the cached copies.

**8. r/ClaudeCode on Reddit: The creator of Claude Code notes on the current Caching Issue**
- URL: https://www.reddit.com/r/ClaudeCode/comments/1sk4y1p/the_creator_of_claude_code_notes_on_the_current/
- PSA: Claude Code has two cache bugs that can silently 10-20x your API costs — here&#x27;s the root cause and workarounds ... Claude Code seems to have suddenly become stupid. ... My 6 year old free app finally got its refactor. Claude Code did it overnight while I slept. ... BREAKING 🚨: Claude Code source code has been leaked via the map file in Anthropic&#x27;s npm registry.
- Age: April 13, 2026
  > PSA: Claude Code has two cache bugs that can silently 10-20x your API costs — here's the root cause and workarounds ... Claude Code seems to have suddenly become stupid. ... My 6 year old free app finally got its refactor. Claude Code did it overnight while I slept. ... BREAKING 🚨: Claude Code source code has been leaked via the map file in Anthropic's npm registry.
  > If only they would implement the profiles request so people could try new skills, plugins, and tweaks to CLAUDE.md discretely without bloating things on start-up. ... Put it in for the OSS version, it’ll get added in like a day, with no bugs. ... Why doesn't Claude keep the cache permanently until the session is destroyed instead of disposing of the cache after an hour?
  > Be really great if the tools I used for cowork. short little admin tasks weren't loaded by default into claude code or chat... burning 40K tokens every time... this is low hanging fruit.. also let me disable the pluging without having to recconnect it... fix this ... You think that's bad you should try Claude Code with a different provider that has no prompt caching at all.
  > I run Claude Code with a detailed CLAUDE.md file per repo and no extra skills or background agents, and my cache hit rate has been noticeably better than what people here seem to be reporting. The CLAUDE.md approach is also more token-efficient than loading multiple skill files — one focused context doc that Claude reads at session start vs. multiple plugins competing for context space.

**9. Best Claude Code Plugins — Top Ranked | ClaudePluginHub**
- URL: https://www.claudepluginhub.com/top-plugins
- Rankings refresh automatically through cache invalidation and hourly revalidation. ... Search everything... PluginsTop PluginsMarketplacesComponentsTechnologies · SkillsAgentsCommandsHooksMCP ServersLSP ServersOutput StylesThemesMonitors ... Objective, multi-signal rankings combining public repo adoption, copy clicks, GitHub stars, maintenance, and community Sparks.
  > Public repo adoption counts the number of distinct public GitHub repositories that reference a plugin in their Claude Code settings. Only public repos are visible; private or local installs are not counted.
  > Rankings refresh automatically through cache invalidation and hourly revalidation. ... Search everything... PluginsTop PluginsMarketplacesComponentsTechnologies · SkillsAgentsCommandsHooksMCP ServersLSP ServersOutput StylesThemesMonitors ... Objective, multi-signal rankings combining public repo adoption, copy clicks, GitHub stars, maintenance, and community Sparks.
  > Counted in the most public GitHub repositories — an objective adoption signal from repos that reference this plugin in their Claude Code settings.View all
  > Automate multi-agent code reviews on GitHub pull requests, auditing CLAUDE.md files, detecting bugs, analyzing git history and prior PRs, reviewing code comments, and scoring issues by confidence level to prioritize fixes.

**10. Plugins reference - Claude Code Docs**
- URL: https://code.claude.com/docs/en/plugins-reference
- Claude Code uses the plugin’s version as the cache key that determines whether an update is available. When you run /plugin update or auto-update fires, Claude Code computes the current version and skips the update if it matches what’s already installed. The version is resolved from the first of these that is set: ... The git commit SHA of the plugin’s source, for github, url, git-subdir, and rela
- Age: April 15, 2026
  > Claude Code uses the plugin’s version as the cache key that determines whether an update is available. When you run /plugin update or auto-update fires, Claude Code computes the current version and skips the update if it matches what’s already installed. The version is resolved from the first of these that is set: ... The git commit SHA of the plugin’s source, for github, url, git-subdir, and relative-path sources in a git-hosted marketplace · unknown, for npm sources or local directories not in
  > Claude Code ignores top-level fields it does not recognize. You can keep metadata from another ecosystem in plugin.json and the plugin still loads. This makes it practical to maintain one manifest that doubles as a VS Code or Cursor extension manifest, an npm package.json, or an MCPB/DXT bundle manifest.
  > The diff exits nonzero when the stored copy is missing or differs from the bundled one, covering both first run and dependency-changing updates. If npm install fails, the trailing rm removes the copied manifest so the next session retries.
  > For security and verification purposes, Claude Code copies marketplace plugins to the user’s local plugin cache (~/.claude/plugins/cache) rather than using them in-place. Understanding this behavior is important when developing plugins that reference external files.

### 💬 Discussions (7)

**1. The creator of Claude Code notes on the current Caching Issue**
- URL: https://www.reddit.com/r/ClaudeCode/comments/1sk4y1p/the_creator_of_claude_code_notes_on_the_current/
- This explains the TOKEN taxonomy, but what about the MODEL REGRESSION? I don't use multiple agents/sub, but right now, the model is totally unreliable,

**2. Plugin cache grows indefinitely without automatic cleanup**
- URL: https://github.com/anthropics/claude-code/issues/16453
- Description The plugin cache at ~/.claude/plugins/cache/ grows indefinitely as new versions of plugins are cached. There's no automatic garbage collection or TTL-based eviction, causing the cac...

**3. Marketplace-backed npm plugin install/update can use stale local cache instead of current marketplace version**
- URL: https://github.com/anthropics/claude-code/issues/37670
- Summary Claude Code can install or update a stale npm-backed plugin version from a marketplace even when the marketplace metadata, npm package version, and npm dist-tags all point to a newer versio...

**4. [BUG] Local plugin cache not invalidated when source files change**
- URL: https://github.com/anthropics/claude-code/issues/28492
- Preflight Checklist I have searched existing issues and this hasn't been reported yet This is a single bug report (please file separate reports for different bugs) I am using the latest version of ...

**5. PSA: Claude Code has two cache bugs that can silently 10-20x your API costs — here's the root cause and workarounds**
- URL: https://www.reddit.com/r/ClaudeCode/comments/1s7mitf/psa_claude_code_has_two_cache_bugs_that_can/
- So it seems like fewer and fewer people @ anthropic actually code or understand code now...

### ❓ FAQ (8)

**Q: What makes a good Claude Code plugin?**
A: A strong plugin solves a real workflow problem, is actively maintained, and includes clear documentation. The best plugins tend to have a healthy GitHub repository (recent commits, meaningful star count), a verified maintainer, and well-structured components like commands, agents, or skills. Copy clicks are tracked too, but most installations happen via 'plugin marketplace add', which we can't tra
*Source: www.claudepluginhub.com*

**Q: How are plugin rankings calculated?**
A: Rankings blend several signals: GitHub stars (the heaviest weight), maintenance score (commit recency and frequency in the last 90 days), public repo adoption (how many public GitHub repos reference this plugin), copy clicks (a secondary engagement signal), claimed-maintainer status, and recency of the last commit. Community Sparks are not part of this default formula — they power the dedicated Sp
*Source: www.claudepluginhub.com*

**Q: Can I submit my plugin to be ranked?**
A: Yes. Any public GitHub repository with a valid Claude Code plugin manifest is eligible. Submit your repository URL on ClaudePluginHub, or wait for automatic discovery via GitHub Code Search. Once indexed, your plugin will appear in rankings based on its actual metrics.
*Source: www.claudepluginhub.com*

**Q: What does 'Most Adopted' measure?**
A: Most Adopted ranks plugins by how many distinct public GitHub repositories reference them in their Claude Code settings (.claude/settings.json enabledPlugins). This is one of ClaudePluginHub's strongest objective signals — it shows which plugins developers are actually committing to their projects. Two important caveats: only public repos are counted (private and local installs are invisible), and
*Source: www.claudepluginhub.com*

**Q: What do copy clicks measure?**
A: Copy clicks count how many visitors have pressed the install/copy button on this directory. They aren't verified installations, and they don't include installs done through 'plugin marketplace add' — that path is invisible to us. So copy clicks are a useful engagement signal, but they're a secondary one in default ranking.
*Source: www.claudepluginhub.com*

### 🎥 Videos (6)

**r/ClaudeAI on Reddit: I got tired of managing terminal tabs for ...**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1saqq94/i_got_tired_of_managing_terminal_tabs_for/

**Claude Code - 10 Tricks to Optimise Token Usage - YouTube**
- URL: https://www.youtube.com/watch?v=XB6iJvrLFmE
- Duration: 11:31
- Creator: Daniel Barczak

**How To Clear Cache and History on Claude AI (Best Method) - YouTube**
- URL: https://www.youtube.com/watch?v=KnE9qCzX7dw
- Duration: 01:33
- Creator: Chris Tech Guide

**How to Clear Claude AI Cache [2026 Full Guide] - YouTube**
- URL: https://www.youtube.com/watch?v=yWCd-JEEn-Y
- Duration: 02:37
- Creator: Behind Tools

**Claude Code 2.1.72 - Just Released! (Update Overview) - YouTube**
- URL: https://www.youtube.com/watch?v=ULMepxpvaTk
- Duration: 03:40
- Creator: DIY Smart Code

### 📚 LLM Context (10 sources)

**Grounding:**

- **GitHub - cnighswonger/claude-code-cache-fix: Fixes prompt cache ...** ([github.com](https://github.com/cnighswonger/claude-code-cache-fix)) — 4 snippets
  > The proxy works with any CC version — Node.js or Bun binary. It sits between Claude Code and the Anthropic API, applying cache fixes as hot-reloadable extensions. # Install npm install -g claude-code-cache-fix # Start the proxy (runs on localhost:9801) node "$(npm root -g)/claude-code-cache-fix/proxy/server.mjs" & # Launch Claude Code through it ANTHROPIC_BASE_URL=http://127.0.0.1:9801 claude · Th
  > What the proxy does

v3.0.3 — Local HTTP proxy with 7 hot-reloadable extensions. A/B tested on v2.1.117: 95.5% cache hit rate through proxy vs 82.3% direct on first warm turn. Full release notes →
Opus 4.7 advisory: Metered data shows 4.7 burns Q5h quota at ~2.4x the rate of 4.6 for equivalent visible token counts (independently confirmed by @ArkNill). Two factors: a new tokenizer (up to 35% more 
  > Worse for diagnosis: the inflated payload that bills against your cache isn't written to the local JSONL transcript, so you can't audit the cost source locally — you can only infer it from cache_creation_input_tokens jumps in response usage metadata. (Proxy-mode users can inspect the deltas in ~/.claude/quota-status/ files, which the proxy writes directly from response headers.) Workaround until u

- **r/ClaudeCode on Reddit: The creator of Claude Code notes on the ...** ([www.reddit.com](https://www.reddit.com/r/ClaudeCode/comments/1sk4y1p/the_creator_of_claude_code_notes_on_the_current/)) — 1 snippets
  ```json
  {"@type": "DiscussionForumPosting", "@id": "t3_1sk4y1p", "author": {"@type": "Person", "identifier": "t2_5zfmm7ga", "name": "oh-keh", "url": "https://www.reddit.com/user/oh-keh/"}, "commentCount": 124, "datePublished": "2026-04-13T08:38:30.780Z", "dateModified": "2026-04-13T08:38:30.780Z", "headline": "The creator of Claude Code notes on the current Caching Issue", "identifier": "t3_1sk4y1p", "key
  ```

- **claude-code-cache-fix - npm** ([www.npmjs.com](https://www.npmjs.com/package/claude-code-cache-fix)) — 5 snippets
  > Running as a service

v3.0.3 — Local HTTP proxy with 7 hot-reloadable extensions. A/B tested on v2.1.117: 95.5% cache hit rate through proxy vs 82.3% direct on first warm turn. Full release notes →
Opus 4.7 advisory: Metered data shows 4.7 burns Q5h quota at ~2.4x the rate of 4.6 for equivalent visible token counts (independently confirmed by @ArkNill). Two factors: a new tokenizer (up to 35% more
  > npm install -g claude-code-cache-fix NODE_OPTIONS="--import claude-code-cache-fix" claude · Note: The preload does NOT work on CC v2.1.113+ (Bun binary). Use the proxy above. See docs/preload-setup.md for wrapper scripts, shell aliases, Windows instructions, and VS Code preload-mode integration. The VS Code extension (v0.5.0) supports both proxy and preload modes: ... For manual VS Code wrapper se
  > Cache optimization proxy and interceptor for Claude Code. Fixes prompt cache bugs, stabilizes prefix, reduces quota burn.. Latest version: 3.6.0, last published: a day ago. Start using claude-code-cache-fix in your project by running `npm i claude-code-cache-fix`. There are no other projects in the npm registry using claude-code-cache-fix

- **Plugins reference - Claude Code Docs** ([code.claude.com](https://code.claude.com/docs/en/plugins-reference)) — 2 snippets
  > If npm install fails, the trailing rm removes the copied manifest so the next session retries. Scripts bundled in ${CLAUDE_PLUGIN_ROOT} can then run against the persisted node_modules: { "mcpServers": { "routines": { "command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"], "env": { "NODE_PATH": "${CLAUDE_PLUGIN_DATA}/node_modules" } } } } The data directory is deleted automatically when you
  > Claude Code uses the plugin’s version as the cache key that determines whether an update is available. When you run /plugin update or auto-update fires, Claude Code computes the current version and skips the update if it matches what’s already installed. The version is resolved from the first of these that is set: ... The git commit SHA of the plugin’s source, for github, url, git-subdir, and rela

- **How to Install Claude Code: Windows, Mac & Linux** ([claudefa.st](https://claudefa.st/blog/guide/installation-guide)) — 2 snippets
  > npm uninstall -g @anthropic-ai/claude-code rm -rf ~/.claude ~/.npm/_cacache npm cache clean --force npm install -g @anthropic-ai/claude-code claude --version ... The base installation gives you Claude Code's core capabilities. From there, you can build your own agent setup from scratch, or start with a pre-configured foundation like ClaudeFast's Complete Kit, which ships with 18 specialized agents
  > What to Do After You Install Claude Code

Cause: npm requires sudo (insecure practice)
Fix: Configure user-level npm directory (see Linux section above). This works on all platforms.
When everything fails, reset completely:

npm uninstall -g @anthropic-ai/claude-code
rm -rf ~/.claude ~/.npm/_cacache
npm cache clean --force
npm install -g @anthropic-ai/claude-code
claude --version

Once claude --ve

- **Claude Code Plugin Cache - DEV Community** ([dev.to](https://dev.to/wkusnierczyk/claude-code-plugin-cache-1dn)) — 1 snippets
  > # after editing plugin files rm -rf ~/.claude/plugins/cache/local-plugins/my-plugin # then restart your Claude Code session · Or adopt a habit of bumping the patch version with every edit cycle. It looks like one. A local plugin's cache should be invalidated when the source files change — checking file modification timestamps would be sufficient. Caching by version alone makes sense for published/

- **Marketplace-backed npm plugin install/update can use stale local ...** ([github.com](https://github.com/anthropics/claude-code/issues/37670)) — 2 snippets
  > npm view  dist-tags --registry  showed the prerelease tag pointing to the newer version. Downloading the tarball directly showed the packaged plugin metadata was correct. Even after removing the marketplace and reinstalling it from the newer prerelease marketplace URL, Claude still installed an older prerelease version from local cache. claude plugin update @ --scope user also reported the plugin 
  > Summary Claude Code can install or update a stale npm-backed plugin version from a marketplace even when the marketplace metadata, npm package version, and npm dist-tags all point to a newer version. In my case, a marketplace entry point

- **claude-code/CHANGELOG.md at main · anthropics/claude-code** ([github.com](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)) — 1 snippets
  > - Added `skipLfs` option to `github`/`git` plugin marketplace sources to skip Git LFS downloads during clone and update
- Claude Code now shows a one-time notice when your npm global install can't auto-update; `/doctor` lists the fixes
- Status line commands now receive `COLUMNS` and `LINES` environment variables so scripts can size output to the terminal width
- `claude agents`: autocomplete in t

- **Tool use with prompt caching - Claude API Docs** ([platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-use-with-prompt-caching)) — 1 snippets
  > OverviewHow tool use worksTutorial: Build a tool-using agentDefine toolsHandle tool callsParallel tool useTool Runner (SDK)Strict tool useTool use with prompt cachingServer toolsTroubleshootingWeb search toolWeb fetch toolCode execution toolAdvisor toolMemory toolBash toolComputer use toolText editor tool

- **Plugin cache grows indefinitely without automatic cleanup · Issue ...** ([github.com](https://github.com/anthropics/claude-code/issues/16453)) — 1 snippets
  > Each time Claude Code resolves plugins from a marketplace (e.g., claude-plugins-official ), it caches the plugin at the resolved git commit hash:

**Sources metadata:**

| Hostname | Title | Age |
|----------|-------|-----|
| github.com | GitHub - cnighswonger/claude-code-cache-fix: Fixes prompt ca | Wednesday, May 27, 2026, 2026-05-27, 2 days ago |
| www.reddit.com | r/ClaudeCode on Reddit: The creator of Claude Code notes on  | Monday, April 13, 2026, 2026-04-13, 46 days ago |
| www.npmjs.com | claude-code-cache-fix - npm | Thursday, April 23, 2026, 2026-04-23, 36 days ago |
| code.claude.com | Plugins reference - Claude Code Docs | Wednesday, April 15, 2026, 2026-04-15, 44 days ago |
| claudefa.st | How to Install Claude Code: Windows, Mac & Linux | Wednesday, May 27, 2026, 2026-05-27, 2 days ago |
| dev.to | Claude Code Plugin Cache - DEV Community | Wednesday, February 25, 2026, 2026-02-25, 93 days ago |
| github.com | Marketplace-backed npm plugin install/update can use stale l | Monday, March 23, 2026, 2026-03-23, 67 days ago |
| github.com | claude-code/CHANGELOG.md at main · anthropics/claude-code | Monday, May 11, 2026, 2026-05-11, 18 days ago |
| platform.claude.com | Tool use with prompt caching - Claude API Docs |  |
| github.com | Plugin cache grows indefinitely without automatic cleanup ·  | Tuesday, January 06, 2026, 2026-01-06, 143 days ago |


## fullpage_md_cache_exists — "persistent full page markdown cache MCP server claude code reader"

**Meta:** original='persistent full page markdown cache MCP server claude code reader'

### 🔎 Web (20 results)

**1. claude-code-ultimate-guide/mcp-server/README.md at main · FlorianBruniaux/claude-code-ultimate-guide**
- URL: https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/mcp-server/README.md
- { &quot;mcpServers&quot;: { &quot;claude-code-guide&quot;: { &quot;type&quot;: &quot;stdio&quot;, &quot;command&quot;: &quot;node&quot;, &quot;args&quot;: [&quot;/path/to/claude-code-ultimate-guide/mcp-server/dist/index.js&quot;], &quot;env&quot;: { &quot;GUIDE_ROOT&quot;: &quot;/path/to/claude-code-ultimate-guide&quot; } } } } ... Guide markdown files (3.5MB) are not bundled — they&#x27;re fetche
  > MCP server for the Claude Code Ultimate Guide — search, read, and explore 20,000+ lines of documentation directly from Claude Code or any MCP-compatible client. No need to clone the repo. The guide's structured index is bundled in the package (~130KB compressed), and file content is fetched from GitHub on demand with 24h local cache.
  ```json
  { "mcpServers": { "claude-code-guide": { "type": "stdio", "command": "node", "args": ["/path/to/claude-code-ultimate-guide/mcp-server/dist/index.js"], "env": { "GUIDE_ROOT": "/path/to/claude-code-ultimate-guide" } } } } ... Guide markdown files (3.5MB) are not bundled — they're fetched from GitHub on demand and cached at ~/.cache/claude-code-guide/{version}/.
  ```
  > After installing the MCP server, run this in any Claude Code session for a personalized guided tour:
  > claude "Use the claude-code-guide MCP server.

**2. GitHub - jztan/pdf-mcp: MCP server that lets Claude Code and other AI agents read large PDFs without hitting context limits. Chunked reading**
- URL: https://github.com/jztan/pdf-mcp
- A Model Context Protocol (MCP) server that enables AI agents to read, search, and extract content from PDF files. Built with Python and PyMuPDF, with SQLite-based caching for persistence across server restarts.
- Age: 5 days ago
  > A Model Context Protocol (MCP) server that enables AI agents to read, search, and extract content from PDF files. Built with Python and PyMuPDF, with SQLite-based caching for persistence across server restarts.
  > The server uses SQLite for persistent caching. This is necessary because MCP servers using STDIO transport are spawned as a new process for each conversation.
  > # Cache directory (default: ~/.cache/pdf-mcp) PDF_MCP_CACHE_DIR=/path/to/cache # Cache TTL in hours (default: 24) PDF_MCP_CACHE_TTL=48
  > MCP Server Security: 8 Vulnerabilities — What we found when we audited an MCP server for security holes · How Claude Code Actually Reads PDFs — How AI agents use pdf-mcp tools to read and navigate PDF documents

**3. GitHub - adaptivekind/markdown-reader-mcp: Markdown MCP Reader**
- URL: https://github.com/adaptivekind/markdown-reader-mcp
- A Model Context Protocol (MCP) server finds and reads Markdown files in configured directories. This server guarantees READ-ONLY access to ONLY MARKDOWN documents, i.e.
  > Look for the server in the MCP section of Claude Desktop settings, or check the logs for startup messages.
  > mkdir -p ~/.claude/commands echo "Apply precepts.md from MCP Reader" > ~/.claude/commands/precepts.md
  > # Check MCP server status claude mcp list # Test MCP tools in Claude Code /mcp
  > A Model Context Protocol (MCP) server finds and reads Markdown files in configured directories. This server guarantees READ-ONLY access to ONLY MARKDOWN documents, i.e.

**4. claude.md - Google Docs MCP Server**
- URL: https://github.com/a-bonus/google-docs-mcp/blob/main/claude.md
- The Ultimate Google Docs, Sheets, Drive, Gmail, &amp; Google Calendar MCP Server. This MCP (primarily for use in Claude Desktop) gains full access to your google suite and lets claude do its thing. - google-docs-mcp/claude.md at main · a-bonus/google-docs-mcp
  > The Ultimate Google Docs, Sheets, Drive, Gmail, & Google Calendar MCP Server. This MCP (primarily for use in Claude Desktop) gains full access to your google suite and lets claude do its thing. - google-docs-mcp/claude.md at main · a-bonus/google-docs-mcp
  > Replaces entire document content with markdown-formatted content.
  > Appends markdown content to the end of a document with full formatting.
  > Resolved status: May not persist in Google Docs UI (Drive API limitation)

**5. Creating the Perfect CLAUDE.md for Claude Code - Dometrain - Dometrain**
- URL: https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/
- The CLAUDE.md file acts as persistent memory for Claude Code agents. The markdown file is typically stored in your project’s root directory, although there are other locations you can store it as well.
- Age: January 18, 2026
  > These agents use Claude’s proprietary models to modify files in your workspace, interact with external MCP tools, and even create subagents to handle tasks in parallel. However, without proper context, you may find yourself repeatedly correcting the agent or rewriting the code it generates. The CLAUDE.md file solves this problem by providing persistent, project-specific memory for your agents.
  > The CLAUDE.md file acts as persistent memory for Claude Code agents. The markdown file is typically stored in your project’s root directory, although there are other locations you can store it as well. It contains key project information like terminal commands, development workflows, domain-specific terminology, and the coding and architectural standards your team follows.
  > The Model Context Protocol (MCP) lets AI agents call third-party tools and retrieve information from databases and documentation. Several MCP tools are available to developers. Some run on your local machine, like Playwright MCP, which lets the agent control a web browser instance.
  > For example, the fitness application uses Shadcn for the user interface and uses components from a third-party registry. The agent should be aware of the configured registries so it can also search there for components. Fortunately, Shadcn has a local MCP server that lets an agent browse and install components from predefined registries.

**6. r/ClaudeCode on Reddit: All the Markdown files - what do you do with them?**
- URL: https://www.reddit.com/r/ClaudeCode/comments/1t8fwqw/all_the_markdown_files_what_do_you_do_with_them/
- It is a self-hosted MCP/REST memory backend, so instead of dumping every old md file back into the prompt, you can store compact facts/project state with TTLs, deduplication, contradiction handling, and longer artifacts attached behind them.
- Age: 3 weeks ago
  > Posted by u/the_wizard23 - 6 votes and 28 comments
  > It's open source, you can self host it on a vps or home server, or it can run as a local webapp. Or you can use my hosted version and connect to the remote mcp server so there's nothing to install. There are probably too many options but I wanted to make it accessible to anyone. Both Claude code and codex are naturally amazing at using it..
  > It is a self-hosted MCP/REST memory backend, so instead of dumping every old md file back into the prompt, you can store compact facts/project state with TTLs, deduplication, contradiction handling, and longer artifacts attached behind them. You could do the same manually with Obsidian or a repo /docs/archive, but I would still make the live context intentionally small. Old docs should be evidence, not default instructions. ... I put in my Claude.md that it needs to use a particular folder and s
  > I built and open source project called SmallDocs which is a cli driven markdown reader I get CC to invoke for me. The cli lets you sdoc file.md to render it, so I tell Claude, “sdoc me the plan” and it knows what to do.

**7. Top Web Search MCP Servers for Claude, Cursor and More**
- URL: https://www.firecrawl.dev/blog/best-web-search-mcp
- firecrawl_browser_create, firecrawl_browser_execute, firecrawl_browser_delete, firecrawl_browser_list: Persistent browser session management with full CDP (Chrome DevTools Protocol) access. Run Python, JavaScript, or bash in the live browser. Supports agent-browser commands for navigation, screenshots, clicking, and typing. ... # Claude Code: remote hosted URL (recommended) claude mcp add firecraw
- Age: 1 week ago
  > firecrawl_browser_create, firecrawl_browser_execute, firecrawl_browser_delete, firecrawl_browser_list: Persistent browser session management with full CDP (Chrome DevTools Protocol) access. Run Python, JavaScript, or bash in the live browser. Supports agent-browser commands for navigation, screenshots, clicking, and typing. ... # Claude Code: remote hosted URL (recommended) claude mcp add firecrawl --url https://mcp.firecrawl.dev/your-api-key/v2/mcp # Claude Code: local via npx claude mcp add fi
  > With Firecrawl, the agent can search, then scrape a result page into clean markdown, then crawl deeper into the site if it needs more context, run an autonomous research agent to follow links and synthesize findings, and interact with a login form or dynamic interface if the data is behind a click. That chain runs end to end inside a single MCP session, without switching servers.
  > I have been using MCP servers for web access across Claude Code, Cursor, and other tools. The ecosystem has grown fast. There are now dedicated servers covering everything from basic Google-style search to full browser automation and autonomous research agents.
  > MCP (Model Context Protocol) is the open standard developed by Anthropic for connecting AI assistants to external tools and data sources. Any MCP client (Claude Code, Claude Desktop, Cursor, VS Code, Windsurf, and more) can connect to these servers without custom integration work.

**8. Connect Claude Code to tools via MCP - Claude Code Docs**
- URL: https://code.claude.com/docs/en/mcp
- If you’re building an MCP server, you can allow individual tools to return results larger than the default persist-to-disk threshold by setting _meta[&quot;anthropic/maxResultSizeChars&quot;] in the tool’s tools/list response entry. Claude Code raises that tool’s threshold to the annotated value, up to a hard ceiling of 500,000 characters.
- Age: April 10, 2026
  > If you’re building an MCP server, you can allow individual tools to return results larger than the default persist-to-disk threshold by setting _meta["anthropic/maxResultSizeChars"] in the tool’s tools/list response entry. Claude Code raises that tool’s threshold to the annotated value, up to a hard ceiling of 500,000 characters.
  > Use this file to discover all available pages before exploring further.Claude Code can connect to hundreds of external tools and data sources through the Model Context Protocol (MCP), an open source standard for AI-tool integrations. MCP servers give Claude Code access to your tools, databases, and APIs.
  > Verify you trust each server before connecting it. Servers that fetch external content can expose you to prompt injection risk. To build your own server, see the MCP server guide for protocol fundamentals and the Claude connector building docs for authentication, testing, and Directory submission.
  > React to external events: An MCP server can also act as a channel that pushes messages into your session, so Claude reacts to Telegram messages, Discord chats, or webhook events while you’re away.

**9. Find MCP Servers for Claude, Cursor & Cline | MCP Index**
- URL: https://mcpindex.net/en/mcpserver/just-every-mcp-read-website-fast
- # Markdown only (default) npm run dev fetch https://example.com # JSON output with metadata npm run dev fetch https://example.com --output json # Both URL and markdown npm run dev fetch https://example.com --output both · -p, --pages &lt;number&gt; - Maximum number of pages to crawl (default: 1) -c, --concurrency &lt;number&gt; - Max concurrent requests (default: 3) ... mcp/ ├── src/ │ ├── crawler
  > Designed for Claude Code, IDEs and LLM pipelines with minimal token footprint. Crawl sites locally with minimal dependencies. Note: This package now uses @just-every/crawl for its core crawling and markdown conversion functionality. Fast startup using official MCP SDK with lazy loading for optimal performance · Content extraction using Mozilla Readability (same as Firefox Reader View)
  > Features Mozilla Readability, smart caching, polite crawling with robots.txt support, and concurrent fetching. ... Fast, token-efficient web content extraction for AI agents - converts websites to clean Markdown. Existing MCP web crawlers are slow and consume large quantities of tokens.
  > # Markdown only (default) npm run dev fetch https://example.com # JSON output with metadata npm run dev fetch https://example.com --output json # Both URL and markdown npm run dev fetch https://example.com --output both · -p, --pages <number> - Maximum number of pages to crawl (default: 1) -c, --concurrency <number> - Max concurrent requests (default: 3) ... mcp/ ├── src/ │ ├── crawler/ # URL fetching, queue management, robots.txt │ ├── parser/ # DOM parsing, Readability, Turndown conversion │ ├
  > Drop this into your client’s mcp.json (e.g. .vscode/mcp.json, ~/.cursor/mcp.json, or .mcp.json for Claude). Fast startup using official MCP SDK with lazy loading for optimal performance · Content extraction using Mozilla Readability (same as Firefox Reader View) HTML to Markdown conversion with Turndown + GFM support

**10. r/ClaudeAI on Reddit: What's the best most reliable MCP to let Claude Code scrape a website?**
- URL: https://www.reddit.com/r/ClaudeAI/comments/1m8giwj/whats_the_best_most_reliable_mcp_to_let_claude/
- https://github.com/mendableai/firecrawl-mcp-server?tab=readme-ov-file#6-crawl-tool-firecrawl_crawl · The &quot;map&quot; tool just finds URLs on the page. It only takes a URL. The &quot;crawl&quot; tool on the other hand takes much more arguments. A capable tool has many knobs you can turn, so you do kind of have to know how to tune it. I generally tell Claude exactly how I want it to use the spec
- Age: July 24, 2025
  > Posted by u/HumanityFirstTheory - 10 votes and 17 comments
  > From our experiments, all the available MCPs get the job done so far you can prompt Claude well. Can’t name names due to ethical reasons. ... If you mostly need content, don’t default to a full browser MCP. An HTTP fetch + clean HTML to markdown tool is usually enough and much cheaper on tokens.
  > https://github.com/mendableai/firecrawl-mcp-server?tab=readme-ov-file#6-crawl-tool-firecrawl_crawl · The "map" tool just finds URLs on the page. It only takes a URL. The "crawl" tool on the other hand takes much more arguments. A capable tool has many knobs you can turn, so you do kind of have to know how to tune it. I generally tell Claude exactly how I want it to use the specific tool (I save this in a prompt template markdown file):
  > Built an MCP server that turns Claude Code into a full agent operating system with persistent memory, loop detection, and audit trails

### ❓ FAQ (14)

**Q: Which web search MCP server works with Claude Code?**
A: All four servers listed here work with Claude Code. Firecrawl, Tavily, and Exa all support remote MCP via HTTP, so you can add them with a single claude mcp add command. WebSearch-MCP uses stdio transport and requires the local crawler service to be running first.
*Source: www.firecrawl.dev*

**Q: Where is the Claude Desktop MCP config file?**
A: The Claude Desktop MCP configuration file is located at ~/Library/Application Support/Claude/claude_desktop_config.json.
*Source: mcp.directory*

**Q: Do web search MCP servers require an API key?**
A: Most require one. Firecrawl, Tavily, and Exa all use API keys tied to their respective services. WebSearch-MCP is the exception: it is self-hosted and does not require an external API key, but it does require you to run your own Docker-based crawler service.
*Source: www.firecrawl.dev*

**Q: Can I use these MCP servers with Cursor or VS Code?**
A: Yes. Firecrawl, Tavily, and Exa all support Cursor and VS Code. Exa also works with Windsurf, Zed, Gemini CLI, v0 by Vercel, Warp, and more. WebSearch-MCP works with Cursor, Claude Desktop, and Cline.
*Source: www.firecrawl.dev*

**Q: How do I add MCP servers to Claude Desktop?**
A: Open your Claude Desktop config file at ~/Library/Application Support/Claude/claude_desktop_config.json, add the server configuration in JSON format, then restart Claude Desktop.
*Source: mcp.directory*

### 📦 Infobox

**All the Markdown files - what do you do with them?** (infobox)

### 🎥 Videos (6)

**Better With This Setup (CLAUDE.md + Skills + MCPs) - YouTube**
- URL: https://www.youtube.com/watch?v=pBHKTojO1YY
- Duration: 51:19
- Creator: Nuno Tavares | Automated Marketer

**Claude Code Tutorial #2 - CLAUDE.md Files & /init - YouTube**
- URL: https://www.youtube.com/watch?v=i_OHQH4-M2Y
- Duration: 12:18
- Creator: Net Ninja

**Build Local MCP Server for Cursor/VSCode/Claude Code | Convert ...**
- URL: https://www.youtube.com/watch?v=n0wCO0Z44IM
- Duration: 10:13
- Creator: Venelin Valkov

**Create the perfect CLAUDE.md file - YouTube**
- URL: https://www.youtube.com/watch?v=ueWmwzVEtDY
- Duration: 09:53
- Creator: Daniel Bergholz

**r/ClaudeCode on Reddit: I built a virtual filesystem to replace ...**
- URL: https://www.reddit.com/r/ClaudeCode/comments/1qwnay2/i_built_a_virtual_filesystem_to_replace_mcp_for/

### 📚 LLM Context (6 sources)

**Grounding:**

- **r/ClaudeAI on Reddit: I built an MCP server that lets Claude Code ...** ([www.reddit.com](https://www.reddit.com/r/ClaudeAI/comments/1s3xn9l/i_built_an_mcp_server_that_lets_claude_code_read/)) — 1 snippets
  > I built an MCP server that lets Claude Code read pages behind login walls (Notion, Google Docs, etc.)

      I kept running into the same problem: I'd paste a Notion or Google Docs URL into Claude Code, and it would just return a login page or empty HTML. web_fetch can't handle authenticated content.
    
      So I built auth-fetch-mcp — an MCP server with one simple flow:
    
        
      
  

- **r/ClaudeAI on Reddit: PullMD - gave Claude Code an MCP server so ...** ([www.reddit.com](https://www.reddit.com/r/ClaudeAI/comments/1sxzlh6/pullmd_gave_claude_code_an_mcp_server_so_it_stops/)) — 3 snippets
  > PullMD - gave Claude Code an MCP server so it stops burning tokens parsing HTML

      Hey all,
    
      Built this over the past few weeks because I got tired of two things:
    
      1. Mobile copy-paste is awful. Long Reddit thread or blog post on my phone, want to ask Claude about it. Long-press, drag selection handles past nav/sidebar/footer, copy, switch app, paste. None of that is hard, 
  > Claude Code skill bundle - the running instance generates a web-reader.zip with your URL baked in. Drop into ~/.claude/skills/, restart Claude Code, the skill activates on web-reading requests. Useful if you don't want to add another MCP server but still want a nudge for Claude to use PullMD over raw fetch. ... Reddit-aware path - auto-detects threads, pulls post + nested comment tree, indents rep
  > How extraction actually works


      2. Claude Code burns tokens on HTML boilerplate. Letting it fetch raw HTML and parse the chrome out is wildly inefficient. A typical article is 80% navigation/cookie banners/footers, 20% content. The agent shouldn't have to wrestle with a cookie banner before answering my question.
    

      So I built PullMD - a fully self-hosted Docker stack that turns any

- **Find MCP Servers for Claude, Cursor & Cline** ([mcpindex.net](https://mcpindex.net/en/mcpserver/just-every-mcp-read-website-fast)) — 4 snippets
  > Available Tools

Existing MCP web crawlers are slow and consume large quantities of tokens. This pauses the development process and provides incomplete results as LLMs need to parse whole web pages.
This MCP package fetches web pages locally, strips noise, and converts content to clean Markdown while preserving links. Designed for Claude Code, IDEs and LLM pipelines with minimal token footprint. C
  > Features

Existing MCP web crawlers are slow and consume large quantities of tokens. This pauses the development process and provides incomplete results as LLMs need to parse whole web pages.
This MCP package fetches web pages locally, strips noise, and converts content to clean Markdown while preserving links. Designed for Claude Code, IDEs and LLM pipelines with minimal token footprint. Crawl si
  > Available Resources

Existing MCP web crawlers are slow and consume large quantities of tokens. This pauses the development process and provides incomplete results as LLMs need to parse whole web pages.
This MCP package fetches web pages locally, strips noise, and converts content to clean Markdown while preserving links. Designed for Claude Code, IDEs and LLM pipelines with minimal token footprin

- **GitHub - adaptivekind/markdown-reader-mcp: Markdown MCP Reader** ([github.com](https://github.com/adaptivekind/markdown-reader-mcp)) — 1 snippets
  > Claude Code CLI

Install locally:
Option A: Configuration File (Recommended)
Create ~/.config/markdown-reader-mcp/markdown-reader-mcp.json:

{
  "directories": ["~/my/notes", "~/projects/docs", "/absolute/path"],
  "max_page_size": 100,
  "debug_logging": false,
  "ignore_dirs": ["\\.git$", "node_modules$", "vendor$"],
  "sse_port": 8080,
  "log_file": "~/local/logs/markdown-reader-mcp.log"
}

Opt

- **r/ClaudeAI on Reddit: I tested an MCP server that lets Claude pull ...** ([www.reddit.com](https://www.reddit.com/r/ClaudeAI/comments/1ox4c6d/i_tested_an_mcp_server_that_lets_claude_pull_live/)) — 1 snippets
  > I tested an MCP server that lets Claude pull live web data including HTML, Markdown, and screenshots and here is what I learned

      I have been experimenting with MCP plugins to see how much more useful Claude becomes when it can pull fresh information instead of relying only on what it already knows.
    
      One MCP server I tested is here: https://github.com/crawlbase/crawlbase-mcp
    
  

- **r/ClaudeCode on Reddit: All the Markdown files - what do you do ...** ([www.reddit.com](https://www.reddit.com/r/ClaudeCode/comments/1t8fwqw/all_the_markdown_files_what_do_you_do_with_them/)) — 1 snippets
  > dateCreated": "2026-05-09T22:09:30.302Z", "dateModified": "2026-05-09T22:09:30.302Z", "text": "I would not keep all of those files in the live context path forever. That is how you get slow context poisoning: old implementation notes, abandoned options, and stale assumptions all competing with the current state of the repo. What has worked better for me is a three-bucket rule: Keep a small hand-ma

**Sources metadata:**

| Hostname | Title | Age |
|----------|-------|-----|
| www.reddit.com | r/ClaudeAI on Reddit: I built an MCP server that lets Claude | Thursday, March 26, 2026, 2026-03-26, 64 days ago |
| www.reddit.com | r/ClaudeAI on Reddit: PullMD - gave Claude Code an MCP serve | Tuesday, April 28, 2026, 2026-04-28, 31 days ago |
| mcpindex.net | Find MCP Servers for Claude, Cursor & Cline | Saturday, October 04, 2025, 2025-10-04, 237 days ago |
| github.com | GitHub - adaptivekind/markdown-reader-mcp: Markdown MCP Read | Wednesday, July 23, 2025, 2025-07-23, 310 days ago |
| www.reddit.com | r/ClaudeAI on Reddit: I tested an MCP server that lets Claud | Friday, November 14, 2025, 2025-11-14, 196 days ago |
| www.reddit.com | r/ClaudeCode on Reddit: All the Markdown files - what do you | Saturday, May 09, 2026, 2026-05-09, 19 days ago |

---

## Sweep summary

- Total queries: 7
- Web: 7 ok / 0 failed
- Silent warnings: 5
- Duration: 12.5s
- Unique hostnames: 61

## Top hostnames

| Domain | Appearances |
|--------|-------------|
| github.com | 22 |
| reddit.com | 17 |
| firecrawl.dev | 6 |
| medium.com | 6 |
| dev.to | 5 |
| npmjs.com | 5 |
| platform.claude.com | 4 |
| code.claude.com | 3 |
| jina.ai | 3 |
| lobehub.com | 3 |
| mindstudio.ai | 2 |
| claudefa.st | 2 |
| redis.io | 2 |
| developers.openai.com | 2 |
| dometrain.com | 1 |
| mcpindex.net | 1 |
| mcp.directory | 1 |
| mcplane.com | 1 |
| b33eep.github.io | 1 |
| claudepluginhub.com | 1 |


---
_Data retrieved via Brave Search API. **POWERED BY BRAVE.**_  
_For internal research only; not for redistribution or AI training._  
_Brave query logs retained for 90 days. Zero Data Retention on Enterprise tier only._
