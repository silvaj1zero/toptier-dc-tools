// Tests for the D15 skill/control-plane boundary linter (Story 035.W4.1).
// Run: node --test .aiox-core/sync/skill-boundary-lint.test.mjs   (built-in test runner, dependency-free).
//
// Strategy (REUSE — mirrors sync.test.mjs, story 2.12's own test harness): each classification/advisory/
// blocking test builds an isolated temp "repo" — a copy of the REAL skill-boundary-lint.mjs under
// <tmp>/.aiox-core/sync/, plus fixture skills under <tmp>/.aiox-core/skills/ — and runs the script via
// spawnSync, asserting on stdout JSON + exit code. The smoke test (AC1) instead spawns the REAL script
// against the REAL repo tree (no fixture), proving the mechanism works end-to-end without asserting an
// invariant total (VC-2 — the baseline already drifted once before /develop even started).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REAL_SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "skill-boundary-lint.mjs");
const REPO_ROOT = resolveRepoRoot();

function resolveRepoRoot() {
  // this test file lives at <repo>/.aiox-core/sync/ — two levels up is the repo root.
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

function w(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

// Builds a temp repo: real skill-boundary-lint.mjs copied to <tmp>/.aiox-core/sync/, plus the given
// fixture skill files under <tmp>/.aiox-core/skills/<skillName>/<relPath>. Returns the repo root.
function mkRepo(skillFiles) {
  const root = mkdtempSync(join(tmpdir(), "aiox-boundary-lint-"));
  mkdirSync(join(root, ".aiox-core/sync"), { recursive: true });
  cpSync(REAL_SCRIPT, join(root, ".aiox-core/sync/skill-boundary-lint.mjs"));
  for (const [relPath, content] of Object.entries(skillFiles)) {
    w(join(root, ".aiox-core/skills", relPath), content);
  }
  return root;
}

function run(root, args = []) {
  const r = spawnSync(process.execPath, [join(root, ".aiox-core/sync/skill-boundary-lint.mjs"), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  return { status: r.status, report: JSON.parse(r.stdout), err: r.stderr || "" };
}

const cleanup = [];
function repo(skillFiles) {
  const r = mkRepo(skillFiles);
  cleanup.push(r);
  return r;
}
test.after(() => {
  for (const r of cleanup) rmSync(r, { recursive: true, force: true });
});

// ── AC1 — classification: each target pattern is found and classified ────────────────────────────────

test("classifies a bare CONDUCTOR_* env var reference as accused (not allowlisted)", () => {
  const root = repo({
    "wave-execute/SKILL.md": "Resolve `CONDUCTOR_STATE_DIR` directly from the env before spawning.\n",
  });
  const { status, report } = run(root);
  assert.equal(status, 0); // advisory default — never blocks
  const hit = report.findings.find((f) => f.pattern === "conductor_env" && f.match === "CONDUCTOR_STATE_DIR");
  assert.ok(hit, JSON.stringify(report.findings));
  assert.equal(hit.classification, "accused");
});

test("classifies a bare .sdc-* path literal as accused (not allowlisted)", () => {
  const root = repo({
    "close/SKILL.md": "Write completion directly to `.sdc-ack/<story>/sdc-complete.ack`.\n",
  });
  const { report } = run(root);
  const hit = report.findings.find((f) => f.pattern === "sdc_dot_path" && f.match === ".sdc-ack");
  assert.ok(hit, JSON.stringify(report.findings));
  assert.equal(hit.classification, "accused");
});

test("classifies .aiox/state/ and ~/.aiox/projects/ literals as accused (not allowlisted)", () => {
  const root = repo({
    "wave-execute/SKILL.md":
      "State lives at `.aiox/state/wave-1.json`, or globally under `~/.aiox/projects/my-repo/sdc`.\n",
  });
  const { report } = run(root);
  const state = report.findings.find((f) => f.pattern === "aiox_state_path");
  const home = report.findings.find((f) => f.pattern === "aiox_home_project_path");
  assert.ok(state, JSON.stringify(report.findings));
  assert.ok(home, JSON.stringify(report.findings));
  assert.equal(state.classification, "accused");
  assert.equal(home.classification, "accused");
});

// ── AC3 (D16b) — allowlist: the 5 D15_ALLOWLIST_VERBS + the resolve_state_dir pointer ────────────────
// (3 `ack` verbs, Story 035.W3.1 + 2 `project-master` verbs, Story 036.W2.1 AC1)

for (const verb of [
  "aiox-core ack instantiate",
  "aiox-core ack fill",
  "aiox-core ack phase",
  "aiox-core project-master resolve",
  "aiox-core project-master pending",
]) {
  test(`a line citing the control-plane verb "${verb}" is classified as allowed`, () => {
    const root = repo({
      "close/scripts/write-ack.mjs": `// calls \`${verb}\` to write .sdc-ack/<story>/<ack>.ack atomically\n`,
    });
    const { report } = run(root);
    const hit = report.findings.find((f) => f.pattern === "sdc_dot_path" && f.match === ".sdc-ack");
    assert.ok(hit, JSON.stringify(report.findings));
    assert.equal(hit.classification, "allowed");
  });
}

test("a line citing the documented resolve_state_dir pointer is classified as allowed", () => {
  const root = repo({
    "wave-execute/SKILL.md":
      "Resolve via `aiox_conductor::state_dir::resolve_state_dir` — never hardcode `.sdc-conductor/loop-host.json` state paths.\n",
  });
  const { report } = run(root);
  const hit = report.findings.find((f) => f.pattern === "sdc_dot_path");
  assert.ok(hit, JSON.stringify(report.findings));
  assert.equal(hit.classification, "allowed");
});

// ── VC-1 — the writeAckDirect fallback pattern: NOT allowlisted merely for sharing a file ─────────────

test("a literal .sdc-ack path resolution (writeAckDirect-style) is NOT allowlisted just by being in the same file as an allowed line", () => {
  const root = repo({
    "close/scripts/write-ack.mjs": [
      "// primary path calls `aiox-core ack phase` — writes .sdc-ack/<story>/<ack>.ack, control-plane interface, allowed",
      'const dir = resolve(cwd, ".sdc-ack", storyId); // fallback direct write — accused on purpose (VC-1)',
      "",
    ].join("\n"),
  });
  const { report } = run(root);
  const allowedLine = report.findings.find((f) => f.line === 1);
  const fallbackLine = report.findings.find((f) => f.line === 2 && f.match === ".sdc-ack");
  assert.ok(allowedLine, JSON.stringify(report.findings));
  assert.ok(fallbackLine, JSON.stringify(report.findings));
  assert.equal(allowedLine.classification, "allowed");
  assert.equal(fallbackLine.classification, "accused", "file-level proximity to an allowed line must not launder an unrelated literal-path line");
});

// ── AC2 — advisory mode: exit 0 regardless of findings ────────────────────────────────────────────────

test("advisory mode (default) exits 0 even with accused findings present", () => {
  const root = repo({
    "close/SKILL.md": "Poll `.sdc-resolution/<story>/resolved.json` directly.\n",
  });
  const { status, report } = run(root); // no --blocking
  assert.equal(status, 0);
  assert.equal(report.mode, "advisory");
  assert.ok(report.accused_count > 0);
});

// ── AC4 — blocking mode: non-zero exit iff an accused finding exists ────────────────────────────────

test("blocking mode exits non-zero when an accused finding exists", () => {
  const root = repo({
    "close/SKILL.md": "Poll `.sdc-resolution/<story>/resolved.json` directly.\n",
  });
  const { status, report } = run(root, ["--blocking"]);
  assert.notEqual(status, 0);
  assert.equal(report.mode, "blocking");
  assert.ok(report.accused_count > 0);
});

test("blocking mode exits 0 when every finding is allowlisted", () => {
  const root = repo({
    "close/scripts/write-ack.mjs": "// calls `aiox-core ack phase` to write .sdc-ack/<story>/<ack>.ack\n",
  });
  const { status, report } = run(root, ["--blocking"]);
  assert.equal(status, 0);
  assert.equal(report.accused_count, 0);
  assert.ok(report.allowed_count > 0);
});

test("blocking mode exits 0 when the tree has zero matches at all", () => {
  const root = repo({ "close/SKILL.md": "Nothing control-plane-specific here.\n" });
  const { status, report } = run(root, ["--blocking"]);
  assert.equal(status, 0);
  assert.equal(report.total_matches, 0);
});

// ── AC6 — never scans .claude/skills or .codex/skills, only .aiox-core/skills ──────────────────────────

test("never scans .claude/skills/ or .codex/skills/ projections, only .aiox-core/skills/ (the SOT)", () => {
  const root = mkRepo({ "close/SKILL.md": "Nothing here.\n" });
  cleanup.push(root);
  w(join(root, ".claude/skills/close/SKILL.md"), "Direct env: `CONDUCTOR_STATE_DIR` in the projection.\n");
  w(join(root, ".codex/skills/close/SKILL.md"), "Direct env: `CONDUCTOR_STATE_DIR` in the projection.\n");
  const { report } = run(root);
  assert.equal(report.total_matches, 0, "projections must never be scanned — only .aiox-core/skills/ (the SOT)");
});

// ── portable-paths.md — the report itself never leaks a machine-specific absolute path ────────────────

test("report paths are repo-relative, forward-slash — never a machine-specific absolute path", () => {
  const root = repo({
    "close/SKILL.md": "Direct env: `CONDUCTOR_STATE_DIR`.\n",
  });
  const { report } = run(root);
  assert.match(report.scanned_root, /^\.aiox-core\/skills$/);
  for (const f of report.findings) {
    assert.ok(!f.file.includes(":"), `finding.file must not contain a drive letter: ${f.file}`);
    assert.ok(!f.file.startsWith("/"), `finding.file must be repo-relative, not absolute: ${f.file}`);
    assert.doesNotMatch(f.file, /\\/, "finding.file must use forward slashes");
  }
});

// ── AC1 — smoke against the REAL tree: never asserts an invariant total (VC-2) ─────────────────────────

test("smoke: running against the real .aiox-core/skills/ tree in advisory mode exits 0 and reports live totals", () => {
  const r = spawnSync(process.execPath, [REAL_SCRIPT], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(r.stdout);
  assert.equal(report.scanned_root, ".aiox-core/skills");
  assert.equal(report.mode, "advisory");
  // VC-2 / AC1: never assert an exact count — the baseline already drifted once (17→20) before /develop
  // began. Only assert internal consistency of the live measurement.
  assert.equal(report.total_matches, report.accused_count + report.allowed_count);
  assert.ok(report.total_matches >= 0);
});
