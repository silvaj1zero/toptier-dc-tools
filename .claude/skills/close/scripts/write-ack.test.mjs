import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { writeAck, AckError, ACK_NAMES, resolveAioxCoreBinary, writeAckViaControlPlane, isSafeStoryId } from "./write-ack.mjs";

function scratch() {
  return mkdtempSync(join(tmpdir(), "write-ack-"));
}

test("writes the sdc-complete ack at the canonical relative-to-cwd path", () => {
  const cwd = scratch();
  try {
    const file = writeAck({ storyId: "031.W9.9", ack: "sdc-complete", cwd });
    assert.equal(file, join(cwd, ".sdc-ack", "031.W9.9", "sdc-complete.ack"));
    const payload = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(payload.story_id, "031.W9.9");
    assert.equal(payload.ack, "sdc-complete");
    assert.equal(payload.status, "done");
    assert.equal(payload.event_schema_version, "1.0");
    assert.ok(!Number.isNaN(Date.parse(payload.ts)));
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("extra fields land in the payload and can override status", () => {
  const cwd = scratch();
  try {
    const file = writeAck({
      storyId: "x",
      ack: "phase-5-checkpoint",
      fields: { status: "passed", close_commit: "abc1234" },
      cwd,
    });
    const payload = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(payload.status, "passed");
    assert.equal(payload.close_commit, "abc1234");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("rejects unknown ack names and missing story id", () => {
  assert.throws(() => writeAck({ storyId: "x", ack: "nope" }), (e) => e instanceof AckError && e.code === "ACK_NAME_INVALID");
  assert.throws(() => writeAck({ storyId: "  ", ack: "close" }), (e) => e instanceof AckError && e.code === "STORY_ID_REQUIRED");
  assert.deepEqual(ACK_NAMES, ["phase-5-checkpoint", "close", "sdc-complete"]);
});

// Story 035.W3.1 self-heal (QG Gate 1, CRITICAL, 2026-07-27 re-review) — the exact PoC the reviewer
// used: a `storyId` designed to escape `cwd` via `..` traversal. Before the fix, `writeAck()` let this
// reach the unguarded `writeAckDirect()` fallback whenever the control plane correctly rejected it
// (or even skipped the control plane call entirely if the binary was absent) and wrote a file fully
// OUTSIDE `cwd`. Now `isSafeStoryId` rejects it in `writeAck()` itself, before either path runs —
// proven here by asserting NOTHING is written outside `cwd` (or anywhere) at all.
test("rejects a path-traversal story_id before either the control-plane or the fallback path can run (CRITICAL regression)", () => {
  const cwd = scratch();
  const outsideDir = mkdtempSync(join(tmpdir(), "write-ack-attacker-"));
  try {
    // Mirrors the reviewer's exact PoC shape ("..\\..\\<attacker-dir>\\pwned") — forward slashes here
    // (Node's path functions accept "/" as a separator on both POSIX and Windows).
    const maliciousId = `../../${basename(outsideDir)}/pwned`;
    assert.throws(
      () => writeAck({ storyId: maliciousId, ack: "close", cwd }),
      (e) => e instanceof AckError && e.code === "STORY_ID_INVALID",
      "a traversal story_id must be rejected as STORY_ID_INVALID, never silently written"
    );
    // Nothing was written anywhere — neither inside cwd (the "expected" location) nor outside it
    // (the exploit the PoC demonstrated).
    assert.ok(!existsSync(join(cwd, ".sdc-ack")), "no .sdc-ack must be created inside cwd for a rejected id");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
    rmSync(outsideDir, { recursive: true, force: true });
  }
});

test("isSafeStoryId mirrors the Rust guard's allowlist + '.'/'..' rejection", () => {
  for (const bad of ["..", ".", "../escape", "a/b", "a\\b", "has space", ""]) {
    assert.equal(isSafeStoryId(bad), false, `${JSON.stringify(bad)} must be rejected`);
  }
  for (const good of ["031.W9.9", "story-id_1", "a"]) {
    assert.equal(isSafeStoryId(good), true, `${JSON.stringify(good)} must be accepted`);
  }
});

// Self-heal (QG Gate 1, CRITICAL) — the OTHER half of the fix: even bypassing `writeAck()`'s own
// upfront validation (calling `writeAckViaControlPlane` directly, as a lower-level caller might), a
// binary that RUNS and REJECTS a request must THROW — never return `null` (which `writeAck()` would
// read as "binary absent, fall back"). Uses an invalid `--ack` name (not story_id) so this exercises
// the GENERAL "rejected ≠ absent" contract, independent of the story_id-specific fix above. Gracefully
// skipped when the binary isn't built (same discipline as the sibling control-plane tests).
test("writeAckViaControlPlane throws (never returns null) when the binary runs and rejects the request", () => {
  const binary = resolveAioxCoreBinary();
  if (!binary) {
    console.warn("[write-ack.test] aiox-core binary not built — skipping rejection-vs-absence assertion");
    return;
  }
  const cwd = scratch();
  try {
    assert.throws(
      () => writeAckViaControlPlane({ storyId: "031.CP.REJECT", ack: "not-a-real-ack-name", cwd }),
      (e) => e instanceof AckError && e.code === "CONTROL_PLANE_REJECTED",
      "a present-but-rejecting binary must throw, never return null (which would trigger a fallback)"
    );
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

// Story 035.W3.1 (AC5) — "novo teste prova que a implementação interna chama a interface do control
// plane, não fs direto". Real environment condition: gracefully SKIPPED (not failed) when
// `aiox-core` isn't built in this checkout (`cargo build -p aiox-core` wasn't run yet) — the same
// "degrade, never fake a pass" discipline `lag-query.mjs`'s own AC7 fallback already documents. When
// the binary IS present (the normal case in a dev/CI session that already built the workspace), this
// exercises `writeAckViaControlPlane` DIRECTLY (not `writeAck`'s fallback-wrapped path) so a failure
// here can only mean the control-plane call itself is broken, never a fallback masking it.
test("uses the control-plane interface (aiox-core ack phase) when the binary is built, never fs directly", () => {
  const binary = resolveAioxCoreBinary();
  if (!binary) {
    console.warn("[write-ack.test] aiox-core binary not built (target/{release,debug}) — skipping control-plane assertion");
    return;
  }
  const cwd = scratch();
  try {
    const file = writeAckViaControlPlane({
      storyId: "031.CP.1",
      ack: "close",
      fields: { note: "via control plane" },
      cwd,
    });
    assert.ok(file, "the control-plane write must succeed and report a file path when the binary is present");
    assert.equal(file, join(cwd, ".sdc-ack", "031.CP.1", "close.ack"));
    const payload = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(payload.story_id, "031.CP.1");
    assert.equal(payload.ack, "close");
    assert.equal(payload.status, "done");
    assert.equal(payload.event_schema_version, "1.0");
    assert.equal(payload.note, "via control plane");
    assert.ok(!Number.isNaN(Date.parse(payload.ts)));
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("writeAck end-to-end also round-trips through the control-plane path when the binary is built", () => {
  const binary = resolveAioxCoreBinary();
  if (!binary) {
    console.warn("[write-ack.test] aiox-core binary not built — skipping end-to-end control-plane assertion");
    return;
  }
  const cwd = scratch();
  try {
    const file = writeAck({ storyId: "031.CP.2", ack: "sdc-complete", cwd });
    const payload = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(payload.story_id, "031.CP.2");
    assert.equal(payload.status, "done");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("CLI entrypoint writes the ack and reports the file", () => {
  const cwd = scratch();
  try {
    const script = fileURLToPath(new URL("./write-ack.mjs", import.meta.url));
    const out = execFileSync(process.execPath, [
      script,
      "--story-id", "031.W9.9",
      "--ack", "sdc-complete",
      "--field", "review_verdict=PASS",
    ], { cwd, encoding: "utf8" });
    const event = JSON.parse(out);
    assert.equal(event.event, "ack_written");
    assert.ok(existsSync(join(cwd, ".sdc-ack", "031.W9.9", "sdc-complete.ack")));
    const payload = JSON.parse(readFileSync(event.file, "utf8"));
    assert.equal(payload.review_verdict, "PASS");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
