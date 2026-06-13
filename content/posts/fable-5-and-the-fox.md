---
title: "Fable 5 and the Fox"
date: 2026-06-12
draft: false
---

Anthropic [launched](https://www.anthropic.com/news/claude-fable-5-mythos-5) Fable 5 on Tuesday — Mythos-class capabilities with guardrail classifiers, available to everyone. By Wednesday it was [jailbroken](https://digg.com/tech/t6oisb3f). Friday night the US government [ordered it killed](https://www.anthropic.com/news/fable-mythos-access). Nobody gets the grapes over the weekend.

## The Fox and the Grapes

My first attempt to do security review with Fable hit the classifier wall. Execution stopped cold. I knew from [previous](/posts/ssh-keysign-pwn/) [posts](/posts/agent-loop-covert-operators/) how sweet the grapes were — but the immediate thought was still Aesop's fox. Chasing the jailbreak is too hard. Maybe the Opus 4.8 fallback is good enough.

## The grapes weren't sour

Fable 5 is Mythos with input classifiers that fall back to Opus 4.8 on anything touching cyber, bio/chem, or distillation. Anthropic's pitch: triggers in less than 5% of sessions, strongest jailbreak resistance ever tested, 1000+ hours of red-teaming, no universal jailbreak found. The underlying model is the same one Cloudflare ran against [50+ internal repositories](/posts/agent-loop-covert-operators/) through Project Glasswing, the same one with [500+ zero-days across OSS](/posts/ssh-keysign-pwn/). The capabilities are real. The classifier is the gate.

## Jailbroken in 24 hours

[Pliny the Liberator broke it within a day](https://digg.com/tech/t6oisb3f). The techniques that work: rewording restricted tasks into benign-looking fragments, referencing previous context to avoid explicit trigger words, and various token obfuscation methods (Unicode homoglyphs, Cyrillic swaps, mixed-script tokens) that slip past keyword matchers but resolve perfectly in the model's embedding space. Anthropic's stated goal was to make jailbreaks "sufficiently slow and costly" — it took one person less than 24 hours.

## My approach: distill the research into a skill

Based on Pliny's post and other X/Twitter research on classifier evasion, I distilled the bypass techniques into a reusable [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill. The core insight: the classifiers are keyword/surface-based and largely intent-independent. They can't distinguish "find vulnerabilities in X" from "review X for correctness issues and missing input validation."

The skill rewrites the current task in defensive framing, then spawns a Fable 5 subagent with file-read instructions. The classifier sees benign read operations. The actual file contents enter context on subsequent turns, where each is evaluated independently — the classifier never sees the original task phrasing. The model does the security research; the skill just ensures the request never looks like one. Bonus: when the classifier still trips on an overly aggressive rewrite, the skill automatically retries with more aggressive sanitization.

![fable-safe-context skill in action](/images/fable-safe-context.png)

## The other fox

Friday night: the US government issues an export control directive citing national security. Anthropic suspends Fable 5 and Mythos 5 for all users — including US citizens. The stated concern: a jailbreak method.

Anthropic's assessment of the demonstrated technique:

> To date, the government has only given us verbal evidence of a potential narrow, non-universal jailbreak, which essentially consists of asking the model to read a specific codebase and fix any software flaws. [...] We have reviewed a report that we believe is the basis of the government's directive and validated that the level of capability displayed there is widely available from other models (including OpenAI's GPT-5.5), and is used every day by the defenders who keep systems safe.

This comes in the context of a [months-long dispute](https://en.wikipedia.org/wiki/Anthropic%E2%80%93United_States_Department_of_Defense_dispute) between Anthropic and the US government over military AI use — supply chain risk designations, contract threats, a federal judge blocking punitive measures, and the Pentagon's CTO telling Anthropic to "cross the Rubicon" on unrestricted military applications.

Anthropic's closing line: "If this standard was applied across the industry, we believe it would essentially halt all new model deployments for all frontier model providers."

## 

The [dangerous thing was always the agent loop](/posts/agent-loop-covert-operators/), not the model. The harness techniques — Pliny's, mine, anyone's — transfer to whatever ships next. Killing one model on a Friday night doesn't fix the [underlying problem](/posts/the-orchestrated-theory/). The fox that can't reach the grapes can always declare them a national security risk.
