import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { callLagTool, LagUnavailable, LagResult, listAdrs, resolveLagMcpBinary } from "./lag-query.mjs";

// Repo root — 4 levels up from `.aiox-core/skills/governance-pipeline/scripts/`.
const REPO_ROOT = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));

function emptyProject(t) {
  const root = mkdtempSync(join(tmpdir(), "aiox-lag-query-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test("resolveLagMcpBinary returns null when neither target/release nor target/debug has the binary (AC7)", (t) => {
  const root = emptyProject(t);
  assert.equal(resolveLagMcpBinary(root), null);
});

test("resolveLagMcpBinary finds a release binary over debug when both exist", (t) => {
  const root = emptyProject(t);
  const exeName = process.platform === "win32" ? "aiox-core.exe" : "aiox-core";
  mkdirSync(join(root, "target", "debug"), { recursive: true });
  mkdirSync(join(root, "target", "release"), { recursive: true });
  writeFileSync(join(root, "target", "debug", exeName), "");
  writeFileSync(join(root, "target", "release", exeName), "");
  assert.equal(resolveLagMcpBinary(root), join(root, "target", "release", exeName));
});

test("resolveLagMcpBinary falls back to debug when only debug exists", (t) => {
  const root = emptyProject(t);
  const exeName = process.platform === "win32" ? "aiox-core.exe" : "aiox-core";
  mkdirSync(join(root, "target", "debug"), { recursive: true });
  writeFileSync(join(root, "target", "debug", exeName), "");
  assert.equal(resolveLagMcpBinary(root), join(root, "target", "debug", exeName));
});

test("callLagTool degrades gracefully (never throws) when the binary is absent (AC7)", async (t) => {
  const root = emptyProject(t);
  const result = await callLagTool("query_graph", {}, { projectRoot: root });
  assert.ok(result instanceof LagUnavailable);
  assert.equal(result.available, false);
  assert.match(result.reason, /binary not found/);
});

test("callLagTool never hangs — resolves within the timeout budget even without a binary", async (t) => {
  const root = emptyProject(t);
  const start = Date.now();
  const result = await callLagTool("list_adrs", {}, { projectRoot: root, timeoutMs: 200 });
  const elapsed = Date.now() - start;
  assert.ok(result instanceof LagUnavailable);
  // absent-binary path resolves immediately (no subprocess spawned) — well under the timeout budget.
  assert.ok(elapsed < 200, `expected fast-path resolution, took ${elapsed}ms`);
});

// Real end-to-end proof against the compiled `aiox-core lag-mcp` binary (031.W4.1) — skipped when the
// binary hasn't been built in this checkout (e.g. a JS-only CI lane with no Rust toolchain), never
// failing the suite on that absence (mirrors AC7's "graceful, never a hard failure" discipline, applied
// here to the test environment itself rather than to a caller skill).
const REAL_BINARY = resolveLagMcpBinary(REPO_ROOT);

test(
  "list_adrs against the real compiled aiox-core lag-mcp server returns the repo's ADR-INDEX (AC2 real integration proof)",
  { skip: REAL_BINARY ? false : "aiox-core binary not built in this checkout — run `cargo build -p aiox-core` first" },
  async () => {
    const result = await listAdrs({ projectRoot: REPO_ROOT, timeoutMs: 10000 });
    assert.ok(result instanceof LagResult, `expected LagResult, got ${JSON.stringify(result)}`);
    assert.equal(result.payload.schema_version, "1.0");
    assert.ok(Array.isArray(result.payload.adrs));
    assert.ok(result.payload.adrs.length > 0);
    assert.ok(result.payload.adrs.every((adr) => typeof adr.adr_id === "string" && typeof adr.status === "string"));
  }
);
