#!/usr/bin/env node
/**
 * UI/UX Gate — mechanical enforcement of D10.d (Story 006.W5.3).
 *
 * The `type: ui-ux` HALT condition ("a ui-ux ADR does not open Phase 0 nor ratify a design
 * decision without `visual_approval` + `spike_ref` on disk") lived only as prose in SKILL.md's
 * "Blocking conditions" section — a described-gate, exactly the category Wave W2 proved
 * insufficient for the Consultive Mandate (1 AskUserQuestion in 458 events). This script makes
 * it mechanical: it reads `adr-progress.json`, and for `type: ui-ux` ADRs only, validates
 * `visual_approval` and `spike_ref` against the real shape/existence bar (AC4), then GRAFTS onto
 * the `006.W2.1` sequence-lock — it writes `.aiox/adr/<slug>/gate-A.ack` / `gate-S.ack` in the
 * exact `{"phase", "status", "ts", "evidence_ref"}` shape W2.1 established for gate-<N>.ack,
 * using the pre-phase letter ("A", "S") as `phase` since these pre-phases run BEFORE the numeric
 * phase 0 (`references/ui-ux-lifecycle.md`).
 *
 * AC3 (architecture unaffected): `type` absent or `"architecture"` → this script performs ZERO
 * checks and writes ZERO ack files. It is a pure no-op — exit 0, one line of output.
 *
 * AC5 (graceful dormant): this script never resolves a design-system binding itself (that's
 * `project-config-bindings.md` + @design-ops's domain) — it only gates on the progress file's
 * own recorded fields. The *skill orchestration* (SKILL.md) is responsible for checking the DS
 * binding before even reaching this script (see "ui-ux gate" section) and HALTing gracefully
 * with the "no DS configured" message when absent, per AC5 — that check is orchestration-level
 * (prose, agent-executed), not something a project-agnostic script can resolve, since the DS
 * root itself is a per-project binding read from the *consuming* project's `aiox.config.json`,
 * which does not exist in every host of this skill.
 *
 * Usage:
 *   node uiux-gate-check.js <path-to-adr-progress.json> [--gate=A|S|both]
 *
 * Exit codes:
 *   0 = gate(s) checked and PASSED (or a no-op for type != ui-ux) — ack file(s) written
 *   1 = gate(s) checked and BLOCKED (ui-ux ADR, condition not met) — no ack file written
 *   2 = usage/IO error (bad path, unreadable JSON, etc.)
 */
'use strict';
const fs = require('fs');
const path = require('path');

function usageError(msg) {
  console.error('ERROR: ' + msg);
  console.error('Usage: node uiux-gate-check.js <path-to-adr-progress.json> [--gate=A|S|both]');
  process.exit(2);
}

const args = process.argv.slice(2);
const progressPath = args[0];
if (!progressPath) usageError('missing <path-to-adr-progress.json>');

const gateArg = (args.find((a) => a.startsWith('--gate=')) || '--gate=both').split('=')[1];
if (!['A', 'S', 'both'].includes(gateArg)) usageError('--gate must be A, S, or both');

let progress;
try {
  progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
} catch (e) {
  usageError('cannot read/parse ' + progressPath + ': ' + e.message);
}

const slugDir = path.dirname(progressPath);
const repoRoot = process.cwd();

/**
 * AC3 — `type` absent or `architecture` ⇒ total no-op. This is the retrocompat guarantee: an
 * architecture ADR (the default) triggers ZERO ui-ux checks, mechanically, not by convention.
 */
const type = progress.type || 'architecture';
if (type !== 'ui-ux') {
  console.log('SKIP — type="' + type + '" (not ui-ux). No ui-ux gate checks performed, no ack written.');
  console.log('RESULT: NO-OP (AC3 — architecture/non-ui-ux ADRs are totally unaffected by this gate).');
  process.exit(0);
}

/**
 * AC4 — legitimate-not-placeholder validation.
 *
 * visual_approval must have the REAL shape: approved_by (non-empty string), approved_at
 * (present), decisions[] (non-empty array). An empty `{}` or a `visual_approval` missing any of
 * these fields does NOT pass — this is the exact anti-pattern D10.d exists to catch (a
 * throwaway/invented "approval" with no real content behind it).
 */
function checkVisualApproval(va) {
  const problems = [];
  if (!va || typeof va !== 'object' || Array.isArray(va)) {
    problems.push('visual_approval is absent or not an object');
    return problems;
  }
  if (!va.approved_by || typeof va.approved_by !== 'string' || va.approved_by.trim() === '') {
    problems.push('visual_approval.approved_by is missing/empty');
  }
  if (!va.approved_at || typeof va.approved_at !== 'string' || va.approved_at.trim() === '') {
    problems.push('visual_approval.approved_at is missing/empty or not a string (a real approval carries a concrete ISO date)');
  }
  if (
    !Array.isArray(va.decisions) ||
    va.decisions.filter((d) => typeof d === 'string' && d.trim() !== '').length === 0
  ) {
    problems.push('visual_approval.decisions[] has no non-empty decision (a real visual approval always captures at least 1 concrete design decision — a blank/whitespace entry does not count)');
  }
  return problems;
}

/**
 * spike_ref must point to a file that EXISTS on disk (repo-relative or slug-dir-relative) — not
 * an invented-looking string. Resolution order: repo-root-relative first (the common case per
 * `ui-ux-lifecycle.md`'s example `outputs/qa/ds-gate-<slug>.yaml`), then slug-dir-relative
 * (fixtures/tests that keep the artifact alongside the progress file).
 */
function checkSpikeRef(spikeRef) {
  const problems = [];
  if (!spikeRef || typeof spikeRef !== 'string' || spikeRef.trim() === '') {
    problems.push('spike_ref is missing/empty');
    return { problems, resolvedPath: null };
  }
  const candidates = [
    path.isAbsolute(spikeRef) ? spikeRef : path.join(repoRoot, spikeRef),
    path.join(slugDir, spikeRef),
  ];
  const resolved = candidates.find((c) => {
    try {
      return fs.existsSync(c) && fs.statSync(c).isFile();
    } catch (_e) {
      return false;
    }
  });
  if (!resolved) {
    problems.push('spike_ref "' + spikeRef + '" does not point to an existing file (checked: ' + candidates.join(', ') + ')');
    return { problems, resolvedPath: null };
  }
  return { problems, resolvedPath: resolved };
}

/**
 * Writes `.aiox/adr/<slug>/gate-<letter>.ack` in the EXACT shape `006.W2.1` established for
 * gate-<N>.ack (AC2 — grafted onto the real sequence-lock, not a parallel mechanism):
 *   {"phase": <N|letter>, "status": "passed", "ts": "<ISO8601>", "evidence_ref": "<string|null>"}
 * The only delta from W2.1's numeric phases is that `phase` is a pre-phase LETTER ("A"/"S")
 * instead of an integer 0-7, since R/M/A/S run BEFORE the numeric phase 0
 * (`references/ui-ux-lifecycle.md`) and are not part of the schema's `phase.current` 0-7 range.
 */
function writeAck(letter, evidenceRef) {
  const ackPath = path.join(slugDir, 'gate-' + letter + '.ack');
  const ack = {
    phase: letter,
    status: 'passed',
    ts: new Date().toISOString(),
    evidence_ref: evidenceRef,
  };
  fs.writeFileSync(ackPath, JSON.stringify(ack, null, 2) + '\n', 'utf8');
  return ackPath;
}

let blocked = false;
const report = [];

if (gateArg === 'A' || gateArg === 'both') {
  const problems = checkVisualApproval(progress.visual_approval);
  if (problems.length > 0) {
    blocked = true;
    report.push('GATE A (visual approval) — BLOCKED:');
    problems.forEach((p) => report.push('  - ' + p));
  } else {
    const ackPath = writeAck('A', 'visual_approval (adr-progress.json)');
    report.push('GATE A (visual approval) — PASSED. Wrote ' + path.relative(repoRoot, ackPath) + '.');
  }
}

if (gateArg === 'S' || gateArg === 'both') {
  const { problems, resolvedPath } = checkSpikeRef(progress.spike_ref);
  if (problems.length > 0) {
    blocked = true;
    report.push('GATE S (spike) — BLOCKED:');
    problems.forEach((p) => report.push('  - ' + p));
  } else {
    const ackPath = writeAck('S', path.relative(repoRoot, resolvedPath));
    report.push('GATE S (spike) — PASSED. Wrote ' + path.relative(repoRoot, ackPath) + '.');
  }
}

console.log(report.join('\n'));
console.log('');
if (blocked) {
  console.log('RESULT: BLOCKED — ui-ux ADR does not open Phase 0 / ratify a design decision (D10.d). Fix the field(s) above and re-run.');
  process.exit(1);
} else {
  console.log('RESULT: PASSED — visual_approval + spike_ref are legitimate and on disk. Phase 0 / design-decision ratification may proceed.');
  process.exit(0);
}
