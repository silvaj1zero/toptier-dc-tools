# @aiox/conductor

Pluggable decision-routing for the **AIOX Conductor**: when an orchestrator spawns
a child (an Agent Team, a pane) and that child hits a blocking decision, the
Conductor routes it to either an autonomous **policy** or a human — without the
child stalling.

**P1 status:** transport seam + portable adapter + skeleton adapter + ported policy.
Run-directly TypeScript (`node --experimental-strip-types`), **zero runtime deps**.

## Layout

| File | Role |
|------|------|
| `src/protocol.ts` | File-protocol decision channel (`pending.json`/`resolved.json`, atomic IO, `watchResolved`). |
| `src/state.ts` | `CbState` — circuit-breaker state for the policy. |
| `src/policy.ts` | The engine — `classifyDecision` + `applyPolicy` + mechanical resolvers. **Zero-token, deterministic.** Ported verbatim. |
| `src/transport.ts` | `ConductorTransport` interface + `HarvestResult`. |
| `src/file-protocol-transport.ts` | **Adapter A** — file-protocol, **functional**. Ships first. |
| `src/native-ipc-transport.ts` | **Adapter B** — in-process IPC, **skeleton** (throws; P3). |
| `src/conductor-loop.ts` | **Conductor-side resolution loop** (Fatia 1): watch pending → policy → auto-resolve or escalate + human reconcile. |
| `src/index.ts` | Barrel. |

## Use

```ts
import { FileProtocolTransport, applyPolicy, freshCbState, buildResolvedFromPolicy } from '@aiox/conductor';

const transport = new FileProtocolTransport(rootDir);
await transport.routeDecision(spawnId, pending);

const result = applyPolicy(pending, 'AL3', freshCbState());
if (result.shouldAutoResolve) {
  const resolved = buildResolvedFromPolicy(result, '1.0');  // resolved_by:'policy'
  // …write resolved into the channel
} else {
  // escalate to a human
}

const resolved = await transport.awaitResolution(spawnId, decisionId);
```

### Conductor-side loop (Fatia 1)

```ts
import { ConductorLoop } from '@aiox/conductor';

const loop = new ConductorLoop({
  rootDir,
  autonomyLevel: 'AL1',          // default: escalate everything (safe). 'AL3' = auto-resolve style/perf (opt-in, owner sign-off).
  onEvent: (e) => log(e),        // conductor_decision_detected | conductor_inject | conductor_escalated
});
loop.start();                     // poll-driven; or call loop.processOnce() for one deterministic sweep
```

It watches `.sdc-decision/*/pending.json`, auto-resolves loopable categories (writing
`resolved.json` with `resolved_by:'policy'`), and leaves the rest for a human — reconciling
once the human (e.g. the cockpit's decision rail) writes `resolved.json`.

## Safety invariant — `false-auto-resolve = 0`

The policy auto-resolves **only** `[style, perf]` (and a mechanical proceed-gate),
**only** at AL3+, **only** inside a circuit breaker. `[security, architecture,
scope_mismatch, missing_dependency, ambiguous, unknown]` **always escalate**.
A decision that should escalate but auto-resolves is a **critical** failure; the
test suite includes a sentinel battery asserting this rate stays at 0.

Auto-resolve (AL3+) must not be enabled in production without explicit owner sign-off.

## Test

```bash
npm test    # 31/31 — node:test via --experimental-strip-types
```

Placement rationale & decision record: `docs/architecture/conductor-p1-placement-proposal.md`.
