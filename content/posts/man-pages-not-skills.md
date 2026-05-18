---
title: "Your CLI Already Has a Knowledge Layer. It's Called man."
date: 2026-05-18
draft: false
---

The AI agent ecosystem has invented SKILL.md — a markdown file that tells agents how to use a tool: what the commands do, what the gotchas are, how to sequence operations. Anthropic launched it as an open standard in December 2025, and by May 2026 their official skills repository had over 136,000 stars. OpenAI's catalog followed at 19,000. Thousands of community skills have been published.

Among them, a growing category: skills for CLI tools that already ship comprehensive documentation. The [`TerminalSkills/skills`](https://github.com/TerminalSkills/skills) repository publishes SKILL.md files for `ffmpeg`, `rsync`, `imagemagick`, `ssh`, `nmap`, and dozens more — all tools with extensive man pages maintained by their respective projects.

For individual CLI tools, this is redundant. The knowledge layer already exists. It's called `man`.

## The Documentation Stack We Already Have

Every well-designed CLI tool has (or should have) two documentation layers:

- `--help`: syntax. What flags exist, what arguments are expected, what subcommands are available. The "what."
- `man`: semantics. Why you'd use a flag, what the edge cases are, how commands compose, what the environment variables do, what files the tool touches, what the known bugs are. The "how" and "why."

Man pages have standardized sections — DESCRIPTION, OPTIONS, EXAMPLES, ENVIRONMENT, FILES, DIAGNOSTICS, BUGS, SEE ALSO — that cover exactly the knowledge SKILL.md files reinvent in ad-hoc markdown. The TerminalSkills `ffmpeg` skill teaches CRF quality values, `-movflags +faststart` for web playback, when to use stream copy (`-c copy`) vs re-encoding, the concat demuxer, and filter_complex syntax. Every one of these is documented in `man ffmpeg` and `man ffmpeg-all`, which ship with the tool, are maintained by the ffmpeg project, and have been indexed by every LLM training run for the past decade.

## Why Agents Already Know man

LLMs are trained on enormous amounts of text that includes millions of man pages, Stack Overflow answers referencing man pages, and decades of Unix culture that treats `man` as the canonical reference. When an agent encounters `man ffmpeg`, it knows exactly what to expect: a SYNOPSIS, a DESCRIPTION, OPTIONS with flag details, and EXAMPLES showing real usage.

SKILL.md is a format that's existed for months. Man pages are a format that's existed for decades. The model has vastly more training signal for one of these.

## Feeding man Pages to Agents

Agent frameworks auto-discover skill files and inject them on task match. Man pages require the agent to know to call `man`. One line in your project config solves this:

```
# In your AGENTS.md or equivalent:
ffmpeg: media processing. Run `man ffmpeg` for docs, `ffmpeg -h full` for flags.
```

As for the pager hanging non-interactive sessions — it doesn't. When stdout is piped (which it always is when an agent runs a shell command), `man` skips the pager automatically. The output is clean, formatted text. If you're paranoid: `MANPAGER=cat man ffmpeg` or `man ffmpeg | col -b`.

## Progressive Disclosure Already Exists

The Agent Skills spec defines a [progressive disclosure](https://agentskills.io/specification#progressive-disclosure) model: metadata (~100 tokens) loads at startup for all skills, the full SKILL.md body (<5000 tokens) loads when activated, and reference files load only when needed.

Man pages have had this structure since the beginning:

1. **NAME section** (~10 tokens): `ffmpeg - ffmpeg media converter`. Equivalent to the skill's `name` + `description` frontmatter.
2. **Main man page** (2,767 lines for ffmpeg): the overview, common options, examples. Equivalent to the SKILL.md body.
3. **SEE ALSO sub-pages** (loaded on demand): `ffmpeg-codecs`, `ffmpeg-filters`, `ffmpeg-formats`, `ffmpeg-protocols` — 12 separate man pages totaling 43,000+ lines. Equivalent to the `references/` directory.

An agent that needs to encode H.265 reads `man ffmpeg`. If it needs the full list of libx265 parameters, it follows the SEE ALSO pointer to `man ffmpeg-codecs`. If it needs filter_complex syntax, it reads `man ffmpeg-filters`. It never loads all 43,000 lines at once — just like a well-structured skill never loads all its references at once.

Mario Zechner [made the same argument about MCP](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/): you don't need a 21-tool MCP server consuming 13,000 tokens when you have Bash, a 225-token README, and the model's existing knowledge of the DOM API. Same logic applies here — lean on what the model already knows instead of re-documenting it in a new format.

## What Might Actually Need a Skill

"Download with yt-dlp, transcode with ffmpeg, upload with rclone" is a multi-tool workflow that no single man page covers. That's coordination knowledge — which tools to compose, in what order, with what flags to make them interoperate. A skill for "media ingest pipeline" that orchestrates three tools with man pages has value. A skill that re-documents what `-crf 23` means does not.

The useful unit of a skill is the workflow, not the tool.

## The Real Issue: Nobody Writes Good Man Pages Anymore

The honest reason SKILL.md exists is that modern CLI tools ship without man pages. Rust CLIs use clap, which can auto-generate man pages that are as thin as `--help`. Go CLIs use cobra, same story. Python CLIs use click or argparse — man pages are an afterthought.

SKILL.md fills the gap left by neglected documentation. For tools that never had good docs, writing a skill is better than nothing. But for tools that *do* have man pages — ffmpeg, rsync, imagemagick, ssh, nmap — the skill is pure duplication with a maintenance cost: a second source of truth that drifts as flags are added, defaults change, and codecs evolve.

The broader pattern here is one the HN discussion on "agent-native CLIs" identified clearly: most of what gets branded as "agent-native design" is just good CLI design and good documentation that we should have been doing all along.

## A Concrete Proposal

If you maintain a CLI tool and want it to work well with AI agents:

1. **Write a proper `--help`**: enumerate valid values for enum flags, show defaults, include one-line examples. Clap's `long_about`, cobra's `Long`, click's `help` parameter — use them.

2. **Write a man page**: authored, not auto-generated. Include EXAMPLES with multi-step workflows, DIAGNOSTICS with error recovery, BUGS with known limitations. If you can write a SKILL.md, you can write a man page — it's the same content in a more universal format.

3. **One line in your agent config**: name the tool, point to `man` and `--help`.

4. **Make your errors actionable**: include valid values in error messages, suggest the correct invocation. This helps humans too.

5. **Respect isatty**: suppress color and pagers when stdout isn't a terminal. This isn't "agent-native design" — it's basic Unix hygiene from the 1980s.

6. **If you write a skill, write it for the workflow, not the tool.**

The result: a tool that works for humans in terminals, for scripts in pipelines, and for agents in agentic sessions — without maintaining a separate documentation artifact that will inevitably drift from the source of truth.

Man pages aren't glamorous. They don't have a marketplace or a star count. But they work, they're universal, and the models already know how to read them.
