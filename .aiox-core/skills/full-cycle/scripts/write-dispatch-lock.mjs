#!/usr/bin/env node
// write-dispatch-lock.mjs — the mechanical dispatch-provenance writer for Phase 5 (/close CHK-0).
//
// Closes the 3×-recurrent gap (Channel-2 findings: 2.1 → 041.W1.1 → 041.W1.2): /close's CHK-0
// demands "a dispatch lockfile for this story+phase (the orchestrator wrote it)", but no /full-cycle
// step ever WROTE it — every orchestrated close paid a HALT + hand-remediation. This script is the
// step. The team-lead invokes it IMMEDIATELY BEFORE the `[ACTION REQUIRED: /close]` dispatch; @po's
// CHK-0 then finds the lockfile mechanically instead of HALTing.
//
// Canonical path (cwd-relative, same AP7 posture as write-ack.mjs — never a path chosen by the
// dispatcher): .aiox/dispatch/<story-id>-phase5-close.lock.json
// This matches the oldest observed remediation convention (story 030.W1.1's close) and is
// deliberately OUTSIDE every skill-boundary-lint accused pattern (not `.sdc-*`, not `.aiox/state/`).
//
//   node write-dispatch-lock.mjs --story-id <id> [--dispatched-by <label>]
//
// Exit 0 on success (prints the written path). Exit 1 on invalid input. Atomic write (tmp+rename).
// Overwrite is allowed and expected on a legitimate re-dispatch after a crash mid-Phase-5 (the
// phase-5-checkpoint ACK — not this lockfile — is the re-dispatch decision point, per /close).

import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : undefined;
}

export function lockPath(cwd, storyId) {
  return resolve(cwd, ".aiox", "dispatch", `${storyId}-phase5-close.lock.json`);
}

export function writeDispatchLock(cwd, storyId, dispatchedBy) {
  if (!storyId || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(storyId)) {
    throw new Error(`invalid --story-id: ${JSON.stringify(storyId)}`);
  }
  const path = lockPath(cwd, storyId);
  mkdirSync(dirname(path), { recursive: true });
  const payload = {
    story_id: storyId,
    phase: "close",
    dispatched_by: dispatchedBy || "full-cycle team-lead",
    ts: new Date().toISOString(),
    schema_version: "1.0",
  };
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
  return path;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  try {
    const written = writeDispatchLock(process.cwd(), arg("story-id"), arg("dispatched-by"));
    console.log(written);
  } catch (e) {
    console.error(`write-dispatch-lock: ${e.message}`);
    process.exit(1);
  }
}
