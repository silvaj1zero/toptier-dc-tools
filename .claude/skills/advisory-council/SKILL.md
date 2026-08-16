---
name: advisory-council
description: Strategic decision support — 5 cognitively-diverse advisors (Contrarian, First Principles, Expansion, Outsider, Executor) via Agent Teams, anonymized blind synthesis. For architecture/product/strategy calls that benefit from diverse perspectives — not domain review (/roundtable) or code review.
version: "1.0.0"
context: conversation
agent: general-purpose
user-invocable: true
argument-hint: "[decision-or-artifact-path]"
status: active
allowed-tools: Read, Agent, TeamCreate, Write
---

# /advisory-council — Cognitively-Diverse Strategic Review

Spawn 5 advisors with **different thinking styles** for a strategic decision, anonymize their input, synthesize blind, then de-anonymize. Use for: strategic decisions, architecture choices, product direction, hard trade-offs. NOT for: domain-expert review (`/roundtable`), code review (`/three-brain`), story validation (`/review`).

**Invocation:** `/advisory-council {decision or artifact}`.

## The 5 advisors (Agent Teams)
- **Contrarian** — steel-man the proposal, then attack its weakest points.
- **First Principles** — reason up from fundamentals; ignore how it's "usually done".
- **Expansion** — surface unseen opportunities and second-order upside.
- **Outsider** — zero internal context, **web/general knowledge only** (isolation contract below).
- **Executor** — pure practicality: can this actually be built/shipped, and what's the cost?

## Anonymization protocol (anti-anchoring — NON-NEGOTIABLE)
The team lead **anonymizes** every advisor's response (strip who said what), **synthesizes blind** (weigh the arguments, not the source), and only **de-anonymizes in the final report**. This prevents anchoring on a "senior" voice and forces the synthesis to judge ideas on merit.

## Outsider isolation contract (NON-NEGOTIABLE)
The Outsider advisor gets **no internal context** — no repo, no prior decisions, only the decision statement + public/web knowledge. Its value is the un-anchored outside view; feeding it internal context destroys that. Keep its prompt clean.

## Execution flow
1. Frame the decision crisply (one statement + the options).
2. Spawn the 5 advisors (real teammates; sequential fallback if the team limit trips).
3. Collect responses → anonymize.
4. Synthesize blind: consensus, tensions, the strongest argument each way.
5. De-anonymize in the report; give a recommendation **without overriding the human** — the founder decides.

## Output
A report: executive summary, the decision, each advisor's contribution (de-anonymized), the blind synthesis, and a recommendation (with the dissent preserved). Persist to `docs/architecture/` if it informs an ADR, else report inline.

## Anti-sycophancy
The council challenges; it does not echo. If all 5 agree too easily, the Contrarian failed — push harder. The recommendation is advisory, never authority.
