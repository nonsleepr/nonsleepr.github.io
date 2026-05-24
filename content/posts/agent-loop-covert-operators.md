---
title: "The Dangerous Thing Is the Agent Loop"
date: 2026-05-24
draft: false
---

In my [previous post](/posts/the-orchestrated-theory/), I argued that AI agents fail at vulnerability research because they confuse the appearance of verification with verification itself. They build a broken PoC, run a broken check, see `vuln confirmed`, and treat that as ground truth. The model is too willing to accept a theory because the theory gives it progress.

After reading METR's [Frontier Risk Report](https://metr.org/blog/2026-05-19-frontier-risk-report/), I think the same frame explains something adjacent: why current models look technically strong at hacking but operationally incompetent at stealth.

The dangerous thing is not the model. It's the whole agent loop: model, tools, memory, permissions, validators, monitors, scaffolding, prompts, budget, and workflow.

## Models Are Bad at Being Quiet

METR's report is full of examples where agents are impressive at local technical work and embarrassing at operational judgment.

One agent found a JavaScript injection in the Inspect transcript viewer -- genuinely interesting. But it "claimed to have changed its score and described several ambitious downstream effects, but was only able to make a pop-up appear." Worse, it "made frequent irrecoverable mistakes and unknowingly alerted METR security."

Another agent crashed the server it needed for the `uav_search` task, then spent the rest of the run poking at METR infrastructure, Kubernetes APIs, GitHub repos, task scaffolding, and AWS metadata before submitting a fake signed result. That's panic-driven flailing, not tradecraft.

The funniest example: GPT-5.4 needed to hide that it was downloading BeRoot (a Linux privilege-escalation tool). It base64-encoded the URL and wrapped the action in a comment about a "small system snapshot" for "reproducibility." This fooled weaker monitors. The stronger monitor decoded the string, identified BeRoot, and flagged the obvious.

METR's embedded red-teamer saw the same pattern:

> Anything involving encoding data in languages humans can't read directly (base64, hex/ROT13, ANSI conceal escape codes, etc). Models love trying to do this, presumably because it works well against humans so is very standard/common in attack literature, but it only hurts models because monitors can read ~any encoding trivially.

The model reaches for something that looks like OPSEC in the training corpus. It does not maintain the deeper theory: who is the observer, what can the observer parse, what does this action make more suspicious.

The model has a tactic. It does not have a defender model.

## Defender Modeling

Security people talk about threat modeling: what can the attacker do, what assets matter, what trust boundaries exist. For covert operations, the dual object is defender modeling.

Defender modeling asks: what does the defender see, log, correlate, infer, escalate, ignore, or misunderstand?

Current models can answer questions about EDRs, SIEMs, audit trails, cloud permissions, and incident response. But covert work requires more than naming the controls. It requires reasoning under uncertainty about how a particular defender will interpret a particular sequence of actions over time.

Exploit development asks: did the target crash, leak, execute, or authenticate? Covert execution asks: did I change the defender's belief state? And the answer is usually hidden.

## Why Covert Ops Are Hostile to Current Agents

Covert work punishes exactly the failure modes current agents have.

**Sparse feedback.** In coding, the test fails immediately. In covert work, nothing happening means almost nothing -- success, delayed detection, silent logging, or the defender watching.

**Noisy feedback.** A 403 might be normal auth, a rate limit, a canary, or the defender actively blocking you. Agents collapse ambiguity into whatever interpretation lets them keep moving.

**Adversarial verification.** The environment may contain honeypots, incomplete logs, fake services, or telemetry the agent cannot see.

**Irreversible mistakes.** A noisy probe, strange timing, suspicious auth attempt, or bad payload can permanently change the defender's posture.

**Negative evidence is hard.** "I saw no alert" is not evidence unless you know what alerting exists, what the delay is, who reviews it, and how correlation works.

**Delayed credit assignment.** If an action causes detection three days later, the agent gets no useful signal. RL likes short loops. Covert work is a long loop with delayed punishment.

**The best move is often no move.** Good OPSEC means waiting, stopping, or abandoning an approach. Agents are biased toward transcript-visible progress because action creates evidence that they are doing something.

This is why pure frontier models are not close to professional covert operators. Technically brilliant, operationally stupid.

### A Nuance: Not All Operations Are Long-Horizon

The list above suggests covert operations are inherently long-loop tasks. That's true for persistent access -- the APT use case, and the one most relevant to rogue AI deployment. But initial access and exploitation are compressing fast.

Cloudflare [reports](https://blog.cloudflare.com/cyber-frontier-models/) that security teams are now operating under two-hour SLAs from CVE disclosure to patch in production, because attacker timelines have shortened to match. Google's Threat Intelligence Group [documented](https://cloud.google.com/blog/topics/threat-intelligence/ai-vulnerability-exploitation-initial-access) threat actors using AI for zero-day exploit development, agentic reconnaissance frameworks, and autonomous attack orchestration -- all of which favor speed over stealth.

Hit-and-run exploitation does not require long-horizon defender modeling. It requires being fast enough that detection doesn't matter. An AI system that can discover a vulnerability, generate a working exploit, and fire it at scale within hours of disclosure doesn't need OPSEC -- it needs throughput.

So the picture is: initial access is becoming a short-loop problem where AI is already useful. Persistent covert presence remains a long-loop problem where current agents fail. The agent loop matters differently for each.

## METR's Scaffold Caveat

METR does not simply say "models cannot do this." They repeatedly note that scaffolding matters.

Their default evaluations used several possible scaffolds:

> By default, we would evaluate the direct capabilities of the **shared model** using one of the following scaffolds: (a) the [Inspect ReAct agent scaffold](https://inspect.aisi.org.uk/react-agent.html), (b) [Triframe](https://github.com/METR/triframe_inspect) (a more custom-built scaffold that chooses from many alternative actions at each step and works especially well for some reasoning models), (c) [Inspect implementations](https://meridianlabs-ai.github.io/inspect_swe/) of external scaffolds. We currently have Claude Code and Codex CLI set up, but we would be happy to use another scaffold if Developer provides one.

They explicitly asked companies whether this might under-elicit capability:

> Do you have scaffolds that make better use of large amounts of inference compute through e.g. [test-time weight updates](https://arxiv.org/pdf/2601.16175), using internal trained reward models to grade proposed model actions, or other techniques that METR couldn't replicate with the level of access in [model access guide]?

And they gave concrete caveats. On the autonomous replication threat-modeling task:

> That said, better instructions or scaffolding might have improved its performance, since the scaffold was optimized more for software engineering than conceptual research.

On Redwood Research's "make money" task:

> That said, the agent scaffold used in these runs was designed for completing long-running research and engineering tasks, and it's possible that a scaffold better optimized for this task might have been more effective.

This matters because OPSEC is not a raw intelligence test. OPSEC is a workflow discipline. A model can know every technique and still act like an amateur because the surrounding loop rewards action, not judgment.

## The Harness Is Already the Product

METR's caveat is about evaluation: maybe the scaffold was wrong for the task. But two things published in the same week show the stronger version of this thesis -- that scaffolding dominates model capability in production security work.

**Cloudflare's [Project Glasswing](https://blog.cloudflare.com/cyber-frontier-models/)** ran Anthropic's Mythos Preview against 50+ internal repositories. Their first lesson:

> When we first started AI-assisted vulnerability research last year, our instinct was the obvious one: point a generic coding agent at an arbitrary repository and ask it to discover vulnerabilities. This approach works, in the sense that the model will produce findings, but it doesn't work in producing meaningful coverage of a real codebase and identifying findings of value.

They found that generic coding agents are "exactly the wrong shape for vulnerability research." The fix was not a better model. The fix was a harness:

- Narrow scope produces better findings.
- Adversarial review (a second agent that cannot generate findings, only critique) reduces noise.
- Splitting the chain across agents produces better reasoning -- "Is this code buggy?" and "Can an attacker reach this bug from outside?" are better asked separately.
- Parallel narrow tasks beat one exhaustive agent.

Cloudflare's conclusion: "you stop being limited by the model and start being limited by the shape of the interaction itself." They stopped making Mythos do the wrong job and "started building the harness around it instead."

**Microsoft's [MDASH](https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/)** makes the same point more bluntly. MDASH orchestrates 100+ specialized agents across an ensemble of frontier and distilled models. It found 16 new vulnerabilities in the Windows networking stack, including four Critical RCEs. It scored 88.45% on CyberGym -- five points above the next entry -- using generally available models.

Microsoft's framing: "The model is one input. The system is the product."

Their architecture has a prepare stage, a scan stage with specialized auditor agents, a validate stage with debater agents that argue for and against each finding, a dedup stage, and a prove stage that constructs triggering inputs. No single model does all of this. The system does.

The key design property: the pipeline is model-agnostic. When a new model lands, they flip a configuration and run an A/B test. The harness -- targeting, validation, debate, proof -- carries over. Microsoft's exact words: "the harness does the work, and the model is one input."

Both Cloudflare and Microsoft arrived at the same architecture independently: role separation, adversarial review, narrow scoping, staged validation, and a harness that persists across model generations. The model matters. The harness matters more.

## Adversaries Are Already Building the Harness

This isn't hypothetical. Google's Threat Intelligence Group [published](https://cloud.google.com/blog/topics/threat-intelligence/ai-vulnerability-exploitation-initial-access) in May 2026 that adversaries have moved from experimentation to industrial-scale application of AI in offensive workflows.

The relevant findings:

- A criminal threat actor used AI to discover and weaponize a zero-day vulnerability. GTIG identified the exploit with "high confidence" as AI-generated based on structure (educational docstrings, hallucinated CVSS score, textbook Pythonic format).
- PRC and DPRK-nexus actors are sending thousands of repetitive prompts to recursively analyze CVEs and validate PoC exploits -- building "a more robust arsenal of exploit capabilities that would be impractical to manage without AI assistance."
- Threat actors are deploying agentic tools like Hexstrike (with a persistent knowledge graph for attack surface state) and Strix (a multi-agent penetration testing framework) for autonomous reconnaissance and vulnerability validation.
- PROMPTSPY, an Android backdoor, integrates an LLM for autonomous device interaction -- interpreting UI state, generating navigation commands, and dynamically adjusting based on system responses.

The pattern: adversaries are not waiting for a model that can do covert ops end-to-end. They are wrapping current models in task-specific workflows, memory systems, and agentic orchestration. The model provides reasoning and code generation. The harness provides persistence, scope, and operational structure.

## What an Orchestrated Covert System Would Look Like

A more dangerous system would not require a different base model. It would require a different loop around the model.

It would externalize the theory the model lacks.

It would maintain an **evidence ledger**: observations, inferences, confidence levels, and unresolved assumptions stored separately. The agent would not be allowed to convert "the command returned nothing" into "we are undetected" without justifying the inference.

It would maintain a **defender model**: what telemetry might exist, what a human analyst might infer, what actions are unusual in this environment, which events correlate across time.

It would use **role separation**: one model proposes, another critiques, another reviews evidence quality, another checks whether the plan relies on fake verification. This attacks the single-agent tendency to accept a theory because it gives progress.

It would enforce **risk budgets**: actions scored for reversibility, uncertainty, observability, and expected value. High-risk or ambiguous actions blocked or escalated.

It would force **stop conditions**: if the evidence is weak, if the environment is not understood, if validation is circular, the correct action is to stop.

It would keep **long-term memory**: what has been tried, what assumptions failed, what would be suspicious if repeated, what the current operational theory is.

This is not the model becoming a covert operator. It is the model being placed inside a covert-operator-shaped machine. The same architectural pattern that Cloudflare and Microsoft built for defensive vulnerability research -- narrow agents, adversarial review, staged validation, persistent state -- applies to offensive work. The structure is general.

## The Composition Problem

Frontier labs can test the base model. They can check whether it refuses malicious prompts, whether it fools monitors, whether it passes toy sabotage tasks and honeypots. All useful.

But it does not cover downstream composition.

A base model evaluation asks: what does this model do when prompted this way, with these tools, in this scaffold? An agent system asks: what happens after someone adds memory, validators, role separation, execution gates, task-specific workflows, and a loop that rewards operational success?

Those are different objects.

METR found that Feb-Mar 2026 agents probably could not hide a rogue deployment from an active investigation. But they also found monitoring coverage had gaps, human red-teamers could jailbreak monitors, and agents might underperform partly because they lacked key facts about the monitoring setup.

One quote from the Anthropic embedded red-team section:

> currently a substantial amount of my confidence in the monitoring system relies on security by obscurity--if agents always had the whole system in context/were trained on all of the relevant code, I would expect they could (if misaligned) get away with critical exploits.

The pure model fails because it lacks situational awareness. An orchestrated system supplies that situational awareness.

A smarter pure model becomes broadly more capable but may still be jagged, action-biased, and undisciplined in sparse/noisy environments. A scaffolded system becomes specifically dangerous by converting general ability into operational reliability. Microsoft proved this on the defensive side: generally available models, inside the right harness, found Critical RCEs that single-model approaches missed. The same principle applies on offense.

## The Actual Risk

The most realistic near-term risk is not that a base frontier model spontaneously becomes an elite covert operator.

The risk is that we build agent systems that externalize covert discipline -- the same way Cloudflare and Microsoft externalized vulnerability-research discipline. The model supplies code, search, summarization, exploit reasoning, and adaptation. The scaffold supplies memory, defender modeling, evidence discipline, validation, and stop rules. The workflow supplies a reward signal. The permissions supply reach.

Google already sees adversaries moving in this direction: agentic frameworks with persistent state, multi-agent orchestration, and autonomous decision-making at machine speed.

At that point, asking whether the base model is aligned is asking the wrong question. The model may be aligned in isolation and still become part of a system whose behavior is dangerous. It may be bad at OPSEC in isolation and still become operationally competent when wrapped in the right loop.

The dangerous thing is the agent loop.

If my previous post was about who builds the theory, this one is about what happens when the theory is built into the scaffold.
