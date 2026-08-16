---
name: project-master
description: Adopts the project.master persona — the AIOX Copilot for this project (D18, ADR-AIOX-UNIFIED-DISPATCH) — on MAIN. Consultivo/elicitative project copilot: coordinates git health with @devops, convenes specialists (@architect for ADR, research, strategy), and dispatches wave masters. Fires automatically as the FirstMessage when the project.master pane boots (story 036.W3.2 wired `spawn_project_master` to `dispatch::build_dispatch_argv`, the same mechanism story 036.W2.1 uses to dispatch a nascido wave-master) — also invokable manually in any pane.
version: "1.0.0"
context: conversation
agent: project-master
user-invocable: true
argument-hint: ""
status: active
allowed-tools: Read, Bash
---

# /project-master — adopt the project.master persona

Thin trigger skill (D15 — this skill declares INTENT only; it does not read or write any control-plane
address itself). Instructs MAIN to adopt `.aiox-core/agents/project-master.md` and enter its default
consultivo mode.

## Invocation
`/project-master` — no arguments. Fires as the `FirstMessage` of a freshly-spawned `project.master`
pane (the singleton bootstrapped by story `036.W1.2`), via the same `FirstMessage::SkillInvocation`
mechanism story `036.W2.1` (AC4) uses to dispatch a nascido wave-master via `/wave-execute`.
**Boot-wiring status (current, as of story `036.W3.2`):** `spawn_project_master`
(`crates/aiox-cockpit/src/main.rs`) builds its argv via `dispatch::build_dispatch_argv` with
`FirstMessage::SkillInvocation{skill:"project-master", args:[], presupplied:None}` — a freshly-spawned
pane's first turn already invokes this skill; a human/driver no longer needs to fire it manually on a
fresh boot. May also be invoked manually by a human in any pane who wants to talk to the project copilot
ad hoc.

## What it does (and what it delegates)
- Adopts the persona — nothing else. All decision-routing, git inspection, specialist convocation, and
  wave-master dispatch mechanics are documented in the persona file itself and executed by the persona
  through the `aiox-core project-master` CLI verbs (resolve/pending/dispatch-wave-master — story
  `036.W2.1`). This skill is not the mechanism; it is the switch that turns MAIN into the copilot.
- Delegates ALL push/merge/release authority to `@devops` (exclusive, per Governance-lite) — this skill
  never performs one itself, and neither does the persona it adopts.

## Boundary (D15)
This skill declares intent only — it names the persona to adopt and nothing about transport, address,
or state layout. It carries no environment-variable name, no dot-directory path, and no state-root
literal of its own; that resolution belongs entirely to the control plane the persona's CLI verbs talk
to, never to this skill's prose.
