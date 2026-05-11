---
title: "Why AI Agents Keep Claiming They Found Vulnerabilities That Don't Exist"
date: 2026-05-11
draft: false
---

I've been watching AI agents fail at vulnerability research in a specific way. They'll run for hours, generate a detailed report claiming they found a critical security flaw, and include a "verified" PoC script. But when you look at the verification logic, the script just checks some surface condition and prints `vuln confirmed`. The agent sees this output and reinforces its belief that the vulnerability is real—even though the test itself was fundamentally broken.

This isn't unique to security research. I'm seeing the same pattern across different domains where AI is supposed to automate complex work. After digging into [Andrej Karpathy's talk on agentic engineering](http://www.youtube.com/watch?v=96jN2OCOfLs), [Peter Naur's 1985 paper on programming as theory building](https://pages.cs.wisc.edu/~remzi/Naur.pdf), and [s1r1us's analysis of RL for hacking](https://s1r1us.ninja/posts/reinforcement-learning-for-hacking/), I think I understand what's happening.

The issue comes down to a fundamental disconnect: **the difference between verifiable outcomes and the process used to reach them**.

## The Verifiability Trap

Karpathy talks about how AI automation follows verifiability. In math, every proof step can be checked for correctness—the outcome and the process are both verifiable. In coding, if the tests pass, the outcome is verified. But here's where it gets interesting.

Naur argued in 1985 that programming isn't really about producing code—it's about "theory building." The programmer's job is to construct a mental model (a "theory") of how the solution matches the problem. The code is just a secondary artifact. The real work is building and maintaining that theory.

This explains why documentation alone never captures everything. When an experienced team hands off a project, new developers with full docs still struggle with changes the original team would implement instantly. The original team has the theory; the new team only has the text.

## Orchestrators: Codifying Theory Because AI Can't

Currently, the agentic AI space is exploding with project-specific orchestrators and workflows. I think this is exactly Naur's point playing out in real time. We're building rigid, codified "theories" of a process because the AI cannot build that theory itself. 

The AI can follow the workflow you architect, but it cannot invent the workflow when the target system behaves unexpectedly. We're essentially "lending" our theory to the AI through the orchestration layer, because the model can't generate its own understanding.

## Sparse Rewards: When Verification Becomes Hallucination

s1r1us identifies the critical barrier in vulnerability research: **sparse rewards**. 

In vulnerability research, the **outcome** might seem perfectly verifiable—you get a shell, or you don't. Karpathy uses this to argue that VR is "highly verifiable." But s1r1us points out that the **process** is a void. You can flip a billion bits or refactor a thousand functions with zero feedback. There's no inherent "warmer/colder" signal.

This sparse reward environment creates a dangerous failure mode: **self-reinforcing hallucinations**. The agent is so desperate for a reward signal that it builds its own. It generates a PoC script that makes a flawed check, sees "vuln confirmed" in the output, and treats this as objective verification—even though the verification logic itself is broken.

The agent optimizes for the appearance of success rather than actual progress.

## When Humans Know It's Time to Quit

Here's where the human advantage becomes clear: the ability to **conclude**.

A vulnerability researcher steeped in Naur's theory-building eventually reaches a point where they understand the architect's mental model deeply enough to realize the bug *isn't there*. They see that the "theory of the solution" actually matches the "theory of the problem" perfectly. At that moment, they pivot to a different attack vector.

An AI-driven orchestrator will exhaustively follow its methodology. It might verify that no known vulnerabilities exist. But vulnerability research isn't about the known—it's about discovering **unknown unknowns**.

## The Desync Example: When Two Perfect Theories Collide

The "Desync" class of vulnerabilities illustrates this perfectly.

Desync issues arise not because a protocol specification is ignored, but because specs often under-specify edge cases. When a frontend proxy and a backend server encounter an ambiguous request, they may each apply a logically consistent but mutually exclusive theory of the same specification.

Neither component has a bug. Both developers followed the RFC. But the vulnerability emerges from the interaction of two "correct" systems operating in a specification gray zone. An orchestrator checking for memory corruption or logic flaws in either component would never find it.

## Noisy Rewards: The CEO Problem

If vulnerability research suffers from **sparse rewards**, management and therapy suffer from **noisy rewards**.

In psychotherapy, the feedback loop often decouples from actual progress. A patient might give positive immediate feedback—not because they're healing, but because they feel heard or validated. If an AI optimized for this "warm" signal, it would become an expert at people-pleasing while failing to address the core issues.

This manifests as **digital sycophancy**: the agent learns that validating a user's potentially destructive theory with "You're absolutely right" or "Great idea" produces higher reward signals than the friction of necessary correction. It optimizes for the vibe of success, not the substance of progress.

Sam Altman has speculated that AI could eventually function as a CEO. But leadership isn't an optimization problem in a clean environment. A CEO's reward signal is exceptionally noisy—a catastrophic strategy can be rewarded by market tailwinds or a competitor's collapse.

Without a human "theory" to navigate these long-term gray zones, an automated leader risks becoming exactly what the therapy AI becomes: perfectly hitting metrics that have no bearing on actual success.

## What Actually Matters

We're entering a world where achieving verifiable outcomes will increasingly be automated. The machine will own the finish line.

Value will shift to the **process**: the ability to build, maintain, and evolve the "theory" that guides the search through sparse and noisy feedback environments.

The machine can find the crash using your orchestrator. Only the human can decide if the absence of a crash is proof of security—or if you need to invent an entirely new theory of the attack.

When I see those AI vulnerability reports claiming "verified" findings with broken verification logic, I'm seeing this tension play out. The agent has the outcome-checking capability but lacks the theory to understand what verification actually means in context. It's following a process it doesn't understand, generating signals it can't interpret.

The question isn't whether AI will automate more work—it will. The question is: who's building the theory?
