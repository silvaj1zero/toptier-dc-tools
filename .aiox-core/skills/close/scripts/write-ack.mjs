#!/usr/bin/env node

// Canonical ACK writer for the /close closure sequence (steps 1/7/8 of SKILL.md).
// The orchestrator's monitor and the conductor's committed_no_ack recovery both key on
// `.sdc-ack/<story_id>/sdc-complete.ack` existing on disk — prose alone proved non-deterministic
// (wave 031.W4: 1 of 3 children wrote it), so the write is mechanical here.
//
// AP7 (skill-agnosticism): paths resolve relative to CWD, never orchestrator-aware — the
// orchestrator's reader is multi-path (Mode 1 root · Mode 6 worktree prefixes).
//
// Story 035.W3.1 (D16b, RF-9, AC5) — this script no longer writes `.sdc-ack/**` via `fs`/
// `renameSync` directly. It invokes the control plane's own writer for this artifact,
// `aiox-core ack phase` (see `.aiox-core/rules/orchestration-telemetry.md`'s sibling module doc,
// `crates/aiox-core/src/ack.rs`'s `D15_ALLOWLIST_VERBS` — the citable name for `035.W4.1`'s D15
// linter), as a subprocess. `ack phase` is a DIFFERENT artifact from the dispatch-ACK
// (`work_unit_id`/`run_id`/`cli`/`model`/`attempt`) that same story also introduces — this one keeps
// the pre-existing `(story_id, phase)` key and byte-identical JSON shape, only the WRITE MECHANISM is
// shared (REUSE of `aiox_conductor`'s atomic tmp+rename, not a 4th hand-rolled implementation).
//
// Graceful fallback (never a NEW hard dependency on a compiled Rust binary): when `target/{release,
// debug}/aiox-core[.exe]` isn't built in this checkout, `writeAck()` falls back to the ORIGINAL direct
// `fs`/`renameSync` write below — `/close` must never break just because nobody ran `cargo build` yet.
// The external contract (return value, `AckError` codes/messages, `ACK_NAMES`, on-disk shape) is
// IDENTICAL on both paths — `write-ack.test.mjs` passes unchanged regardless of which one executes.
//
// Self-heal (QG Gate 1, CRITICAL — 2026-07-27 re-review) — "binary absent" and "binary present but the
// control plane correctly REJECTED the request" are NOT the same case and must NEVER share a code path.
// The reviewer's PoC: a malicious `storyId` (`"..\\..\\<attacker-dir>\\pwned"`) was correctly rejected
// by `aiox-core ack phase` (`STORY_ID_INVALID`), and the PREVIOUS version of this file silently fell
// through to the unguarded `writeAckDirect()`, which wrote fully OUTSIDE `cwd`. Fixed two ways
// (defense-in-depth, neither alone is "the" fix):
//   1. `isSafeStoryId` mirrors the Rust guard (`aiox_conductor::is_safe_spawn_id` + `.`/`..` rejection,
//      `crates/aiox-core/src/ack.rs`'s `is_safe_phase_story_id`) in JS, enforced in `writeAck()` BEFORE
//      either the control-plane call or the fallback ever run — a malicious id never reaches either.
//   2. `writeAckViaControlPlane` now distinguishes `result.error` (the binary genuinely could not be
//      spawned/executed — safe to fall back) from `result.status !== 0` with no `result.error` (the
//      binary RAN and REJECTED the request — its guard did its job; this THROWS, terminal, never
//      returns `null` to trigger a fallback).

import { mkdirSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export const ACK_NAMES = ["phase-5-checkpoint", "close", "sdc-complete"];

export class AckError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AckError";
    this.code = code;
  }
}

/** This script's own repo root — `.aiox-core/skills/close/scripts/write-ack.mjs` is 4 levels under
 * the root (scripts → close → skills → .aiox-core). Resolved from `import.meta.url`, NEVER from the
 * `cwd` a caller passes (that's the STORY's working directory — e.g. a worktree — unrelated to where
 * `target/` lives for THIS checkout). Mirrors `lag-query.mjs`'s `resolveLagMcpBinary` idiom (same
 * release-then-debug candidate order) — kept as its own small copy rather than a cross-skill import:
 * REUSE has a floor, and importing a LAG-specific module from `/close` for a 10-line helper would be a
 * worse shape mismatch than a short, honest duplicate (the same call this codebase already makes for
 * `wave::resolve_root` vs. `companion::resolve_root`). */
function repoRootFromThisScript() {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "..", "..");
}

/** Locate a built `aiox-core` binary. Returns `null` (never throws) when nothing is found — the
 * caller degrades to the direct-write fallback. */
export function resolveAioxCoreBinary(repoRoot = repoRootFromThisScript()) {
  const exeName = process.platform === "win32" ? "aiox-core.exe" : "aiox-core";
  for (const profile of ["release", "debug"]) {
    const candidate = join(repoRoot, "target", profile, exeName);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** Self-heal (QG Gate 1, CRITICAL, defense-in-depth #1) — mirrors
 * `crates/aiox-core/src/ack.rs`'s `is_safe_phase_story_id` (itself `aiox_conductor::is_safe_spawn_id` +
 * explicit `.`/`..` rejection): alnum + `. - _` only, never a bare `.` or `..`. Enforced in `writeAck()`
 * BEFORE either the control-plane call or the direct-write fallback runs — a malicious `story_id` never
 * reaches either path, independent of whether the Rust binary happens to be present. */
const SAFE_STORY_ID_RE = /^[A-Za-z0-9._-]+$/;
export function isSafeStoryId(id) {
  return SAFE_STORY_ID_RE.test(id) && id !== "." && id !== "..";
}

/**
 * AC5 — the control-plane path: spawns `aiox-core ack phase` (sync — `writeAck()` below is itself
 * synchronous, and the CLI direct-invocation contract at the bottom of this file also expects a
 * synchronous return). Returns the written file's path on success. `null` means "the binary is
 * genuinely unusable — safe to fall back" (not found, or `spawnSync` itself couldn't launch it, e.g.
 * `result.error` from a permissions/corrupt-exe failure). A binary that RAN and REJECTED the request
 * (non-zero exit with NO `result.error`) is an entirely different case — see the CRITICAL self-heal
 * note above the imports — and THROWS an `AckError` instead of returning `null`, so `writeAck()` can
 * never silently route a rejected request into the unguarded fallback. Exported so tests can exercise
 * it directly and PROVE this path is what actually wrote the file when the binary is present (AC5's
 * own testable clause: "prova que a implementação interna chama a interface do control plane, não fs
 * direto").
 */
export function writeAckViaControlPlane({ storyId, ack, fields = {}, cwd }) {
  const binary = resolveAioxCoreBinary();
  if (!binary) return null;

  const args = ["ack", "phase", "--story-id", storyId, "--ack", ack, "--root", cwd];
  for (const [k, v] of Object.entries(fields)) {
    args.push("--field", `${k}=${String(v)}`);
  }
  const result = spawnSync(binary, args, { cwd, encoding: "utf8" });

  if (result.error) {
    // The binary itself could not be spawned/executed at all (ENOENT racing a delete, EACCES,
    // corrupt exe, …) — genuinely unusable. Safe to degrade to the direct-write fallback.
    process.stderr.write(
      `[write-ack] aviso: aiox-core não pôde ser executado, caindo para escrita direta: ${result.error.message}\n`
    );
    return null;
  }

  if (result.status !== 0) {
    // The binary RAN and REJECTED the request (e.g. STORY_ID_INVALID) — its own guard did exactly
    // its job. This is NEVER a "binary unavailable" case. Falling back here would silently DEFEAT
    // that guard — the exact CRITICAL the reviewer's PoC confirmed. Terminal, not a fallback trigger.
    const stderrMsg = result.stderr?.trim() || `aiox-core ack phase exited ${result.status}`;
    throw new AckError("CONTROL_PLANE_REJECTED", stderrMsg);
  }

  try {
    const event = JSON.parse(result.stdout.trim());
    if (!event.file) {
      throw new AckError("CONTROL_PLANE_MALFORMED_OUTPUT", `aiox-core ack phase exited 0 with no 'file' in its output: ${result.stdout}`);
    }
    return event.file;
  } catch (e) {
    if (e instanceof AckError) throw e;
    // exit 0 but stdout wasn't valid JSON — a genuine control-plane bug, not an "absent binary" case;
    // surface it rather than silently mask it behind a fallback that would hide the real defect.
    throw new AckError("CONTROL_PLANE_MALFORMED_OUTPUT", `aiox-core ack phase exited 0 but stdout was not valid JSON: ${result.stdout}`);
  }
}

/** The pre-035.W3.1 direct write — kept verbatim as the fallback for a checkout without a built
 * `aiox-core` binary. Byte-identical shape/path to what `ack phase` itself produces.
 *
 * `035.W4.1` (D15 linter, VC-1) — the `resolve(cwd, ".sdc-ack", storyId)` line below is a KNOWN,
 * ACCEPTED exception to D15 ("a skill declares intent; the control plane resolves transport"): it is
 * the resiliency fallback (see the module header above), not a residual bug. The linter
 * (`.aiox-core/sync/skill-boundary-lint.mjs`) classifies allowlisted-vs-accused per LINE, not per file
 * — VC-1 decision (b): only a line that itself cites `aiox-core ack phase`/`instantiate`/`fill` (or the
 * `resolve_state_dir` pointer) is allowlisted. This line does not, so it stays a visible ACCUSED
 * finding on purpose — the primary path 60-odd lines above calling `ack phase` does NOT launder this
 * one by proximity. Do not "fix" this by broadening the allowlist to the whole file; if this fallback
 * is ever removed, the finding disappears on its own. */
function writeAckDirect({ storyId, ack, fields, cwd }) {
  const payload = {
    story_id: storyId,
    ack,
    status: "done",
    ts: new Date().toISOString(),
    event_schema_version: "1.0",
    ...fields,
  };

  const dir = resolve(cwd, ".sdc-ack", storyId);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${ack}.ack`);
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  renameSync(tmp, file); // atomic publish — a reader never observes a partial ack
  return file;
}

export function writeAck({ storyId, ack, fields = {}, cwd = process.cwd() }) {
  const id = String(storyId ?? "").trim();
  if (!id) throw new AckError("STORY_ID_REQUIRED", "--story-id is required");
  if (!ACK_NAMES.includes(ack)) {
    throw new AckError("ACK_NAME_INVALID", `--ack must be one of: ${ACK_NAMES.join(", ")}`);
  }
  // Self-heal (QG Gate 1, CRITICAL, defense-in-depth #1) — validated HERE, before either the
  // control-plane call or the direct-write fallback, so a malicious story_id never reaches either
  // path (independent of whether `aiox-core` happens to be built in this checkout).
  if (!isSafeStoryId(id)) {
    throw new AckError("STORY_ID_INVALID", `--story-id ${JSON.stringify(id)} — use [A-Za-z0-9._-], never '.' or '..'`);
  }

  const viaControlPlane = writeAckViaControlPlane({ storyId: id, ack, fields, cwd });
  if (viaControlPlane) return viaControlPlane;

  return writeAckDirect({ storyId: id, ack, fields, cwd });
}

function parseArgs(argv) {
  const args = { fields: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--story-id") args.storyId = argv[++i];
    else if (arg === "--ack") args.ack = argv[++i];
    else if (arg === "--field") {
      const pair = String(argv[++i] ?? "");
      const eq = pair.indexOf("=");
      if (eq < 1) throw new AckError("FIELD_INVALID", `--field expects key=value, got: ${pair}`);
      args.fields[pair.slice(0, eq)] = pair.slice(eq + 1);
    } else throw new AckError("ARG_UNKNOWN", `unknown argument: ${arg}`);
  }
  return args;
}

// O guard anterior montava a URL à mão — `new URL(\`file:///${argv[1].replace(/\\/g, "/")}\`)` — e isso
// só funciona no Windows: lá `C:\…` vira `file:///C:/…` e casa. Em POSIX o argv[1] JÁ começa com `/`,
// então o template produzia `file:////Users/…` (4 barras) e NUNCA casava com `import.meta.url`. O efeito
// era o pior possível para um marcador de pipeline: a CLI saía `exit 0` sem escrever ACK nenhum, e
// sucesso ficava indistinguível de no-op (medido em campo no /close da 036.W3.1, 2026-08-01; card
// `docs/backlog/write-ack-cli-noop-on-posix.md`). `pathToFileURL` é a primitiva que o Node expõe
// exatamente para isto e é correta nos dois SOs. A 2ª cláusula é cinto-e-suspensório para diferenças de
// normalização de path (`./x.mjs` vs `/abs/x.mjs`); ambas continuam FALSAS quando o módulo é importado
// — que é o caso que o guard existe para distinguir.
const thisFilePath = fileURLToPath(import.meta.url);
const invokedDirectly =
  Boolean(process.argv[1]) &&
  (import.meta.url === pathToFileURL(process.argv[1]).href || resolve(process.argv[1]) === resolve(thisFilePath));
if (invokedDirectly) {
  try {
    const file = writeAck(parseArgs(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify({ event: "ack_written", file })}\n`);
  } catch (error) {
    process.stderr.write(`[write-ack] ${error.code ?? "ERROR"}: ${error.message}\n`);
    process.exit(1);
  }
}
