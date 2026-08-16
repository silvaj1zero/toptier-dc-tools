#!/usr/bin/env node
// skill-boundary-lint.mjs — D15 skill/control-plane boundary linter (Story 035.W4.1, ADR-AIOX-UNIFIED-
// DISPATCH §3/§7 O2). Generalizes D1 ("a skill declares intent; the control plane resolves transport,
// address and layout") with a mechanical fiscal: accuses `CONDUCTOR_*` env var names, `.sdc-*` path
// literals, and other control-plane-specific state-path literals written directly inside
// `.aiox-core/skills/**` — the class of defect the F-10 incident was (a skill polling
// `CONDUCTOR_ROOT_DIR` while the hook wrote `CONDUCTOR_STATE_DIR`, 3 stuck sessions).
//
//   node .aiox-core/sync/skill-boundary-lint.mjs              # ADVISORY (default) — exit 0 regardless of findings
//   node .aiox-core/sync/skill-boundary-lint.mjs --blocking   # BLOCKING — exit 1 iff any ACCUSED finding
//
// Scans .aiox-core/skills/** ONLY — the SOT. NEVER .claude/skills/ or .codex/skills/ (generated
// projections; scanning them would duplicate findings against files nobody is allowed to hand-edit,
// per the "Framework & dot-dir model" — CLAUDE.md).
//
// REUSE (IDS, Dev Notes): same file-walker discipline and dependency-free node:fs/node:path/node:url
// posture as .aiox-core/sync/sync.mjs (this is the same class of mechanism — a mechanical fiscal over
// the SOT tree — not a new system). Lives alongside sync.mjs/sync.test.mjs (AC6) and is invoked with
// the SAME command locally and from CI (.github/workflows/ci.yml's projection-guard job, AC5) — zero
// duplicated logic between the two call sites.
//
// AC1 — measured LIVE, never hardcoded: the baseline this story's Context cites already drifted once
// (.sdc-* 17→20 occurrences) between the story's own drafting and its /validate pass — proof that any
// test asserting a fixed total would break on the next legitimate SKILL.md addition (VC-2). This script
// therefore never asserts an invariant count; it reports whatever it finds, live, every run.

import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOT = resolve(dirname(fileURLToPath(import.meta.url)), ".."); // .aiox-core/ (this script's own location)
const ROOT = resolve(SOT, ".."); // repo root
const SKILLS_DIR = join(SOT, "skills");

const argv = process.argv.slice(2);
const BLOCKING = argv.includes("--blocking");

// AC1 — D15 boundary patterns: env var names / literal path prefixes that address a control-plane
// transport location directly, instead of the skill declaring intent and letting the control plane
// resolve it. A small, named, extensible list (No-Invention — not a DSL) — add a pattern here, never a
// parallel mechanism.
export const PATTERNS = [
  { name: "conductor_env", re: /\bCONDUCTOR_[A-Z_]+\b/g },
  { name: "sdc_dot_path", re: /\.sdc-[A-Za-z0-9_-]*/g },
  { name: "aiox_state_path", re: /\.aiox\/state\/[^\s`'")]*/g },
  { name: "aiox_home_project_path", re: /~\/\.aiox\/projects\/[^\s`'")]*/g },
];

// AC3 (D16b) — the control-plane interfaces this linter recognizes as legitimate. Source:
// `D15_ALLOWLIST_VERBS` (`crates/aiox-core/src/ack.rs:38`), the citable constant `035.W3.1`'s AC6 left
// prepared exactly for this linter — not just `ack fill` (a DISTINCT dispatch-ACK verb; the real
// migrated call site, `write-ack.mjs:106`, invokes `ack phase`). Mirrored here in JS exactly like
// `write-ack.mjs`'s `SAFE_STORY_ID_RE` mirrors its Rust counterpart (`is_safe_phase_story_id`) — any
// rename of a verb in `ack.rs` MUST update this list in the SAME commit; this is the single JS copy.
//
// Story 036.W2.1 (AC1) added the 2 `project-master` verbs (`project_master.rs`) to the SAME Rust
// list — mirrored here in the SAME commit, per that constant's own doc-comment requirement.
export const ALLOWLIST_VERBS = [
  "aiox-core ack instantiate",
  "aiox-core ack fill",
  "aiox-core ack phase",
  "aiox-core project-master resolve",
  "aiox-core project-master pending",
];
// A documented pointer to the control plane's own state-dir resolver is likewise legitimate — it is a
// REFERENCE to the interface, not a hardcoded address.
export const ALLOWLIST_POINTER = "aiox_conductor::state_dir::resolve_state_dir";

// AC3 — classification is LINE-scoped, never FILE-scoped (VC-1 decision (b), see write-ack.mjs's own
// doc-comment at the `writeAckDirect` fallback for the symmetric note): a line is "allowed" only when
// IT ITSELF cites one of the allowlisted interfaces. A literal path resolution living elsewhere in the
// same file (e.g. `write-ack.mjs`'s `writeAckDirect` fallback, `resolve(cwd, ".sdc-ack", storyId)`) is
// NOT allowlisted merely because the file's primary path elsewhere calls `aiox-core ack phase` — it
// stays a visible, honest ACCUSED finding (a known/accepted exception, documented in-file), so a future
// reader is never misled into thinking the whole file is clean.
export function isAllowedLine(line) {
  return ALLOWLIST_VERBS.some((v) => line.includes(v)) || line.includes(ALLOWLIST_POINTER);
}

function walkFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

function relPath(p) {
  return relative(ROOT, p).split("\\").join("/"); // portable-paths.md — always repo-relative, forward-slash
}

// AC1 — the scan itself: file-walker + regex, machine-readable findings. `skillsDir` is overridable for
// tests (a fixture tree); production always uses the real SOT (`SKILLS_DIR`, resolved from this
// script's own location, exactly like sync.mjs's `SOT`).
export function scan(skillsDir = SKILLS_DIR) {
  const findings = [];
  for (const file of walkFiles(skillsDir)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    const allowed = isAllowedLine.bind(null);
    lines.forEach((line, idx) => {
      const lineAllowed = allowed(line);
      for (const { name, re } of PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          findings.push({
            file: relPath(file),
            line: idx + 1,
            pattern: name,
            match: m[0],
            classification: lineAllowed ? "allowed" : "accused",
          });
          if (m[0].length === 0) re.lastIndex += 1; // guard against zero-width matches looping forever
        }
      }
    });
  }
  return findings;
}

function main() {
  const findings = scan();
  const accused = findings.filter((f) => f.classification === "accused");
  const report = {
    schema_version: "1.0",
    scanned_root: relPath(SKILLS_DIR),
    mode: BLOCKING ? "blocking" : "advisory",
    total_matches: findings.length,
    accused_count: accused.length,
    allowed_count: findings.length - accused.length,
    findings,
  };
  console.log(JSON.stringify(report, null, 2));

  if (accused.length) {
    console.error(
      `[skill-boundary-lint] ${accused.length} ACCUSED finding(s) (control-plane-address literal, not allowlisted by D15_ALLOWLIST_VERBS/${ALLOWLIST_POINTER}) ` +
        `out of ${findings.length} total match(es) under ${report.scanned_root} — see file:line in the JSON report above.`,
    );
  } else {
    console.error(
      `[skill-boundary-lint] OK — 0 accused findings (${findings.length} total match(es), all allowlisted) under ${report.scanned_root}.`,
    );
  }

  if (BLOCKING && accused.length) {
    process.exitCode = 1; // AC4 — blocking mode: non-zero exit iff an ACCUSED finding exists
  } else {
    process.exitCode = 0; // AC2 — advisory mode (default) never blocks, regardless of findings
  }
}

main();
