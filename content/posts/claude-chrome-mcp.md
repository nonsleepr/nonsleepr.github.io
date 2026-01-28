---
title: "Claude Chrome MCP: Browser Automation for Any MCP Client"
date: 2025-01-28
draft: false
---

Anthropic recently released [Claude in Chrome](https://claude.com/chrome) to a wider audience, and the [demos](https://x.com/claudeai/status/2010805682434666759) are impressive. The extension lives in your browser sidebar and can perform agentic tasks on the web - essentially browsing for you. While other tools offer similar capabilities (Perplexity's Comet, OpenAI Atlas), Anthropic approaches the problem with safety in mind: [strong prompting](https://www.anthropic.com/research/prompt-injection-defenses) to resist prompt injection and [robust permission controls](https://support.claude.com/en/articles/12902446-claude-in-chrome-permissions-guide).

Even better, Claude Code can connect to this extension via `claude --chrome`, giving it the ability to "see" and interact with web applications it develops. But there's a catch: **this requires a Claude subscription**. If you're using your own API keys or prefer other agentic tools, you're locked out.

**Until now.**

## Why I Built Claude Chrome MCP

I've tried other browser automation options like [Playwright MCP](https://github.com/microsoft/playwright-mcp) and [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp), but Claude in Chrome consistently works with better precision. The secret sauce? Anthropic's [Computer Use API](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool).

Introduced in October 2024, Computer Use API is Anthropic's unified approach to human-computer interaction. Instead of dozens of confusing tools, it's a single `computer` tool with a versatile `action` parameter: screenshots, scrolling, clicking, typing, keyboard shortcuts, even zooming into specific screen regions. Claude models are fine-tuned on this API, which explains why they operate browsers so naturally with it.

## How It Works

I reverse-engineered how `claude --chrome` communicates with the extension. It uses Chrome's [native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging) protocol:

1. Claude Code registers a native messaging host (via the undocumented `claude --chrome-native-host` command)
2. The extension communicates with the host via stdin/stdout
3. The host relays commands via Unix socket to Claude Code
4. Claude Code exposes the browser tools as an MCP server

With this knowledge, I built [**Claude Chrome MCP**](https://github.com/nonsleepr/claude-chrome-mcp) - an open-source MCP server that bridges the Claude Chrome Extension to **any** MCP client.

## What Your Agent Can Do

With Claude Chrome MCP, your AI agent gains full browser capabilities:

- **Browse and research** - navigate websites, read page content, extract article text
- **Fill out forms** - enter text, select dropdowns, click buttons and checkboxes
- **Interact naturally** - click, scroll, type, use keyboard shortcuts, hover over elements
- **Search pages semantically** - find elements by description like "the search bar" or "add to cart button" (requires Claude subscription)
- **Debug web apps** - read console logs, inspect network requests, execute JavaScript
- **Capture and share** - take screenshots, record multi-step workflows as animated GIFs with click indicators
- **Manage tabs** - open new tabs, switch between them, resize the browser window

## Security First

My implementation uses streamable HTTP instead of Unix sockets. While this increases the attack surface, it's mitigated by:

- **Localhost-only binding** (127.0.0.1)
- **Auto-generated auth tokens** (256-bit, secure by default)
- **CORS policy** restricting origins

These defenses prevent unauthorized access from arbitrary web pages or network hosts.

> [!NOTE]
> I did **not** implement authorization [according to the MCP spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) since it's a newer revision that most clients don't support yet.

## Making Tools Agent-Friendly

A good tool should be ergonomic - obvious when and how to use it. After observing agents struggle with the raw extension API, I simplified the MCP tool parameters. For example, there's no need to pass tab group IDs since the extension only allows one tab group per MCP connection (a security feature that isolates browser sessions).

One caveat: semantic element search (finding elements by description like "the login button") requires a logged-in Claude subscription since it uses Claude Haiku under the hood. All other capabilities work without any subscription.

## Get Started in Minutes

```bash
# Install the package
bun install -g git+https://github.com/nonsleepr/claude-chrome-mcp.git

# Register native host and generate auth token
claude-chrome-mcp --install

# Restart Chrome completely
```

The `--install` command outputs a ready-to-use client configuration with your auth token. You can retrieve it anytime with `claude-chrome-mcp --status`.

For [OpenCode](https://opencode.ai/), add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "chrome": {
      "type": "remote",
      "url": "http://localhost:3456/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_FROM_INSTALL"
      }
    }
  }
}
```

For other MCP clients, use the standard transport configuration:

```json
{
  "mcpServers": {
    "chrome": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3456/mcp",
        "headers": {
          "Authorization": "Bearer YOUR_TOKEN_FROM_INSTALL"
        }
      }
    }
  }
}
```

## The Results

I've replaced Playwright MCP and Chrome DevTools MCP entirely in my workflow. The precision of Claude's Computer Use API makes a noticeable difference.

If you're using any MCP client beyond Claude Code - whether that's [OpenCode](https://opencode.ai/), a custom setup, or you're just using your own API keys - give [Claude Chrome MCP](https://github.com/nonsleepr/claude-chrome-mcp) a try. Installation takes a few minutes, and you'll unlock Anthropic's best browser automation for your preferred tools.

**Repository**: [github.com/nonsleepr/claude-chrome-mcp](https://github.com/nonsleepr/claude-chrome-mcp)
