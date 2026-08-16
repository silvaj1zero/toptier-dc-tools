// node --test write-dispatch-lock.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { writeDispatchLock, lockPath } from "./write-dispatch-lock.mjs";

const SELF = fileURLToPath(new URL("./write-dispatch-lock.mjs", import.meta.url));

test("escreve o lockfile canônico cwd-relativo com o shape esperado", () => {
  const cwd = mkdtempSync(join(tmpdir(), "wdl-"));
  try {
    const written = writeDispatchLock(cwd, "041.W1.2", undefined);
    assert.equal(written, lockPath(cwd, "041.W1.2"));
    assert.ok(written.replace(/\\/g, "/").endsWith(".aiox/dispatch/041.W1.2-phase5-close.lock.json"));
    const d = JSON.parse(readFileSync(written, "utf8"));
    assert.equal(d.story_id, "041.W1.2");
    assert.equal(d.phase, "close");
    assert.equal(d.dispatched_by, "full-cycle team-lead");
    assert.ok(Date.parse(d.ts) > 0);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test("rejeita story-id inválido (vazio e path-traversal)", () => {
  const cwd = mkdtempSync(join(tmpdir(), "wdl-"));
  try {
    assert.throws(() => writeDispatchLock(cwd, undefined, undefined), /invalid --story-id/);
    assert.throws(() => writeDispatchLock(cwd, "../evil", undefined), /invalid --story-id/);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test("re-dispatch legítimo sobrescreve sem erro", () => {
  const cwd = mkdtempSync(join(tmpdir(), "wdl-"));
  try {
    writeDispatchLock(cwd, "030.W1.1", "a");
    const written = writeDispatchLock(cwd, "030.W1.1", "b");
    assert.equal(JSON.parse(readFileSync(written, "utf8")).dispatched_by, "b");
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test("entrypoint CLI escreve e imprime o path", () => {
  const cwd = mkdtempSync(join(tmpdir(), "wdl-"));
  try {
    const out = execFileSync(process.execPath, [SELF, "--story-id", "999.W9.9"], { cwd, encoding: "utf8" }).trim();
    assert.ok(existsSync(out));
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
