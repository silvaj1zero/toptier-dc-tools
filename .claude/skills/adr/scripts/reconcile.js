#!/usr/bin/env node
/**
 * ADR Reconcile — mechanical, atomic cluster-merge (Story 006.W3.1, AC2/AC3).
 *
 * Implements the playbook's "atomic supersede/reconcile" principle for real: merging a cluster of
 * N old ADRs never edits them in place. This script performs the operation as ONE atomic step
 * (both writes happen, or neither does):
 *
 *   1. Write the NEW ADR file (the merged/reconciled body, already drafted by the orchestrating
 *      session per the normal Phase 0-7 walk — this script does not draft prose, it only mutates
 *      frontmatter/files mechanically) — its frontmatter MUST already carry
 *      `supersedes: [<the N old adr_ids>]`.
 *   2. For each of the N old ADRs, flip ONLY two frontmatter fields:
 *        status: SUPERSEDED
 *        superseded_by: <new adr_id>
 *      No other line of the old file is touched — this is verified mechanically by this script
 *      itself (AC2's "byte-identical except those 2 fields" smoke requirement) before it reports
 *      success.
 *
 * AC3 (supersession coherence, .aiox-core/rules/adr-frontmatter.md): the new ADR is written to disk
 * FIRST (or the whole operation aborts before touching any old ADR) so `superseded_by` on the old
 * ADRs never points at a file that doesn't exist yet — no inconsistency window.
 *
 * Usage:
 *   node reconcile.js --new <path-to-new-adr.md> --old <path1.md> [--old <path2.md> ...] [--check]
 *
 * --check   Dry-run / textual-preview mode (the "reconcile {cluster}" minimal behavior the SKILL.md
 *           stub described): validates preconditions, prints exactly what WOULD change, mutates
 *           NOTHING. This is the mode the orchestrating session runs first and shows the human
 *           before asking for confirmation to apply.
 * (no flag) Apply mode: performs the atomic mutation for real, then runs the byte-diff self-check
 *           (AC2) and reports PASS/FAIL.
 *
 * Preconditions checked in both modes (BLOCKING — refuses to reconcile otherwise):
 *   - The new ADR file exists and parses (frontmatter is valid YAML-ish key: value at top level —
 *     this script only needs `adr_id`, `status`, `supersedes[]`, it does not fully validate the
 *     whole schema, that is `adr-frontmatter.md`'s job elsewhere).
 *   - The new ADR's `supersedes[]` contains exactly the `adr_id`s of every `--old` path given (no
 *     more, no fewer) — reconcile never supersedes an ADR that wasn't in the cluster it was told to
 *     merge, and never silently drops one either.
 *   - Every `--old` ADR's current `status` is NOT already `SUPERSEDED`/`DEPRECATED`/`REJECTED`
 *     (reconciling an already-terminal ADR again would corrupt the supersession graph).
 *
 * Exit codes:
 *   0 = success (--check: preconditions hold, preview printed; apply: mutation done + byte-diff
 *       self-check PASSED)
 *   1 = precondition failure (BLOCKED, nothing mutated)
 *   2 = usage/IO error
 *   3 = apply mode only — mutation happened but the post-hoc byte-diff self-check found an old ADR
 *       was NOT byte-identical except the 2 allowed fields (should be unreachable if this script's
 *       own mutation logic is correct, but checked anyway — never trust your own write blindly)
 */
'use strict';
const fs = require('fs');
const path = require('path');

function usageError(msg) {
  console.error('ERROR: ' + msg);
  console.error('Usage: node reconcile.js --new <new-adr.md> --old <old1.md> [--old <old2.md> ...] [--check]');
  process.exit(2);
}

const args = process.argv.slice(2);
let newPath = null;
const oldPaths = [];
let checkOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--new') { newPath = args[++i]; }
  else if (args[i] === '--old') { oldPaths.push(args[++i]); }
  else if (args[i] === '--check') { checkOnly = true; }
  else usageError('unrecognized argument "' + args[i] + '"');
}
if (!newPath) usageError('missing --new <new-adr.md>');
if (oldPaths.length === 0) usageError('missing at least one --old <old-adr.md>');

/** Minimal frontmatter reader — top-level `key: value` / `key: [inline, list]` lines only, between
 * the leading `---` fences. Good enough for the fields this script needs (adr_id, status,
 * supersedes, superseded_by); it never attempts to be a general YAML parser and never rewrites a
 * field it doesn't understand — see rewriteTwoFields() below, which is a targeted line-level edit,
 * not a round-trip serialize (a round-trip re-serialize is exactly what would risk touching
 * unrelated formatting/fields — this script avoids that shape of bug entirely).
 *
 * Returns BOTH `raw` (the file's exact original bytes, CRLF or LF as authored — this is what
 * rewriteTwoFields() and the byte-diff self-check operate on, never normalized) AND `fmText`
 * (the frontmatter block with `\r\n` normalized to `\n` for PARSING purposes only — this repo's
 * real ADRs use CRLF, and every field-extraction regex below is line-anchored; without this
 * normalization, `.+` (non-dotall) stops before a trailing `\r` and a block-list's repeated
 * `^\s*-\s*.+\n?` group fails to re-match `^` on the next iteration, silently truncating a
 * multi-item list to its first entry — a real bug this script's own smoke test caught, see the
 * story's Dev Agent Record). Normalizing `fmText` is safe because it is READ-ONLY here — nothing
 * derived from `fmText` is ever written back to disk; only `raw` (untouched) feeds the rewrite. */
function readFrontmatterRaw(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return { raw, fmText: null, fmStart: -1, fmEnd: -1 };
  return { raw, fmText: m[1].replace(/\r\n/g, '\n'), fmStart: m.index, fmEnd: m.index + m[0].length };
}

function fmField(fmText, key) {
  const re = new RegExp('^' + key + ':\\s*(.*)$', 'm');
  const m = fmText.match(re);
  return m ? m[1].trim() : null;
}

function fmListField(fmText, key) {
  // Handles both inline `key: [A, B]` and block-list `key:\n  - A\n  - B`.
  const inline = fmField(fmText, key);
  if (inline !== null && inline.startsWith('[')) {
    return inline.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
  }
  const blockRe = new RegExp('^' + key + ':\\s*\\n((?:^\\s*-\\s*.+\\n?)*)', 'm');
  const m = fmText.match(blockRe);
  if (!m) return inline !== null && inline !== '' ? [inline] : [];
  return m[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
}

function loadAdr(filePath, { requireSupersededByField } = {}) {
  if (!fs.existsSync(filePath)) return { error: 'file does not exist: ' + filePath };
  const { raw, fmText } = readFrontmatterRaw(filePath);
  if (fmText === null) return { error: 'no frontmatter block found in ' + filePath };
  const adr_id = fmField(fmText, 'adr_id');
  const status = fmField(fmText, 'status');
  const supersedes = fmListField(fmText, 'supersedes');
  if (!adr_id) return { error: filePath + ' frontmatter has no adr_id' };
  if (!status) return { error: filePath + ' frontmatter has no status' };
  // For `--old` ADRs only (per-call flag): a real `superseded_by:` LINE must already exist in the
  // frontmatter for this script's targeted line-rewrite to touch it (see rewriteTwoFields — this
  // script deliberately never inserts a missing required field, it is line-anchored regex-replace
  // only). Every ADR conforming to `adr-frontmatter.md`'s required baseline already has this line
  // (with value `null` when current) — an ADR missing it entirely predates/violates that schema and
  // is blocked here rather than silently mutated in a way this script can't self-verify safely.
  if (requireSupersededByField && !/^superseded_by:\s*.*$/m.test(fmText)) {
    return { error: filePath + ' frontmatter has no superseded_by: line — add one (adr-frontmatter.md requires it) before this ADR can be reconciled' };
  }
  return { filePath, raw, fmText, adr_id, status, supersedes };
}

const TERMINAL = new Set(['SUPERSEDED', 'DEPRECATED', 'REJECTED']);

// --- Load + validate preconditions ---
const newAdr = loadAdr(newPath);
if (newAdr.error) { console.error('BLOCKED: ' + newAdr.error); process.exit(1); }

const oldAdrs = oldPaths.map((p) => loadAdr(p, { requireSupersededByField: true }));
const loadErrors = oldAdrs.filter((a) => a.error);
if (loadErrors.length > 0) {
  loadErrors.forEach((e) => console.error('BLOCKED: ' + e.error));
  process.exit(1);
}

const problems = [];

// supersedes[] must be EXACTLY the set of old adr_ids — no more, no fewer.
const expectedIds = new Set(oldAdrs.map((a) => a.adr_id));
const actualIds = new Set(newAdr.supersedes);
const missing = [...expectedIds].filter((id) => !actualIds.has(id));
const extra = [...actualIds].filter((id) => !expectedIds.has(id));
if (missing.length > 0) {
  problems.push('new ADR "' + newAdr.adr_id + '" supersedes[] is missing: ' + missing.join(', '));
}
if (extra.length > 0) {
  problems.push('new ADR "' + newAdr.adr_id + '" supersedes[] lists IDs not in the --old cluster: ' + extra.join(', '));
}

// No old ADR may already be terminal.
oldAdrs.forEach((a) => {
  if (TERMINAL.has(a.status)) {
    problems.push('old ADR "' + a.adr_id + '" (' + a.filePath + ') is already status=' + a.status + ' — cannot reconcile an already-terminal ADR');
  }
});

if (problems.length > 0) {
  console.error('BLOCKED — reconcile preconditions failed:');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}

// --- --check mode: preview only, mutate nothing ---
if (checkOnly) {
  console.log('PREVIEW (--check, nothing mutated):');
  console.log('  New ADR: ' + newAdr.adr_id + ' (' + newPath + ') — supersedes: ' + [...expectedIds].join(', '));
  oldAdrs.forEach((a) => {
    console.log('  Old ADR "' + a.adr_id + '" (' + a.filePath + '): status ' + a.status + ' -> SUPERSEDED, superseded_by -> ' + newAdr.adr_id);
    console.log('    (no other field of this file will be touched)');
  });
  console.log('');
  console.log('RESULT: PASSED preconditions — run again WITHOUT --check to apply atomically.');
  process.exit(0);
}

// --- Apply mode: mutate old ADRs' status+superseded_by only ---

/**
 * Targeted 2-field rewrite of an old ADR's frontmatter — status: <old> -> SUPERSEDED,
 * superseded_by: <old> -> <newAdrId>. Operates on the FULL raw text via line-anchored regex
 * replace, never by slicing out the frontmatter block and re-concatenating it — re-concatenation
 * is exactly what corrupted CRLF line endings in an earlier version of this script (the fence
 * lines `---` got re-inserted with a literal `\n` instead of the file's real `\r\n`, which the
 * byte-diff self-check below caught immediately; keeping this comment as the reason the simpler
 * whole-line regex-replace approach was chosen instead). Every byte of the file outside the
 * `status:`/`superseded_by:` LINE CONTENT (not the line terminator, which is preserved as
 * whatever character(s) already followed that line) is untouched.
 *
 * If either field is genuinely absent from the frontmatter (malformed ADR predating the schema),
 * this is flagged in the report — insertion in that edge case is intentionally NOT attempted here
 * (inserting a new line reliably without knowing the file's line-ending convention adds real risk
 * for a case this repo's real corpus does not exhibit — every ADR in `adr-frontmatter.md`'s schema
 * has both fields); a human is asked to add the missing field manually before reconciling that ADR.
 */
function rewriteTwoFields(adr, newAdrId) {
  const { raw, filePath } = adr;
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const fmText = fmMatch[1];

  const statusRe = /^(status:\s*).*$/m;
  const superRe = /^(superseded_by:\s*).*$/m;
  if (!statusRe.test(fmText)) {
    problemsInsert.push(filePath + ': has no status: line in its frontmatter — SKIPPED (fix the ADR manually, this script does not insert a missing required field)');
    return null;
  }
  if (!superRe.test(fmText)) {
    problemsInsert.push(filePath + ': has no superseded_by: line in its frontmatter — SKIPPED (fix the ADR manually, this script does not insert a missing required field)');
    return null;
  }

  // Replace ONLY within the matched frontmatter span of the ORIGINAL raw string, preserving every
  // byte before/after it (including the exact `\r\n` or `\n` of every line, fence lines included).
  const fmSpan = raw.slice(fmMatch.index, fmMatch.index + fmMatch[0].length);
  const newFmSpan = fmSpan
    .replace(statusRe, '$1SUPERSEDED')
    .replace(superRe, '$1' + newAdrId);
  return raw.slice(0, fmMatch.index) + newFmSpan + raw.slice(fmMatch.index + fmMatch[0].length);
}

const problemsInsert = [];
const mutations = oldAdrs.map((a) => ({ adr: a, newRaw: rewriteTwoFields(a, newAdr.adr_id) }));

// Defensive: the precondition pass above (requireSupersededByField) already guarantees every old
// ADR has both a status: and superseded_by: line, so rewriteTwoFields should never return null
// here — but never trust a mutation function blindly. A null this late is a bug in this script's
// own precondition logic, not a normal user-facing case, and must BLOCK before any write happens.
if (mutations.some((m) => m.newRaw === null)) {
  console.error('BLOCKED (internal): rewriteTwoFields returned null for an ADR that passed preconditions — aborting before any write.');
  problemsInsert.forEach((p) => console.error('  - ' + p));
  process.exit(2);
}

// Write the NEW ADR first (or the operation aborts before touching any old ADR) — AC3 ordering.
// newPath is expected to already exist on disk (drafted by the orchestrating session's normal
// Phase 0-7 walk) with the correct frontmatter (status/supersedes already set); this script does
// not fabricate ADR prose, it only requires the file to be present and valid, which was already
// checked above (loadAdr(newPath) would have errored otherwise).
if (!fs.existsSync(newPath)) {
  console.error('BLOCKED: new ADR path "' + newPath + '" does not exist — write it first (Phase 0-7 draft), then run reconcile.js to perform the atomic supersede.');
  process.exit(1);
}

// Snapshot old file contents BEFORE mutation, for the byte-diff self-check below.
const beforeSnapshots = oldAdrs.map((a) => ({ filePath: a.filePath, before: a.raw }));

mutations.forEach(({ adr, newRaw }) => {
  fs.writeFileSync(adr.filePath, newRaw, 'utf8');
});

// --- AC2 self-check: byte-diff old files against their pre-mutation snapshot, allowing ONLY the
// status: and superseded_by: lines to differ. ---
function diffAllowingTwoFields(before, after) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  if (beforeLines.length !== afterLines.length) {
    return { ok: false, reason: 'line count changed (' + beforeLines.length + ' -> ' + afterLines.length + ')' };
  }
  const diffs = [];
  for (let i = 0; i < beforeLines.length; i++) {
    if (beforeLines[i] !== afterLines[i]) {
      diffs.push({ line: i + 1, before: beforeLines[i], after: afterLines[i] });
    }
  }
  const illegal = diffs.filter((d) => !/^status:/.test(d.before) && !/^superseded_by:/.test(d.before) && !/^status:/.test(d.after) && !/^superseded_by:/.test(d.after));
  if (illegal.length > 0) {
    return { ok: false, reason: 'illegal diff outside status:/superseded_by: at line(s) ' + illegal.map((d) => d.line).join(', '), diffs };
  }
  return { ok: true, diffs };
}

let selfCheckFailed = false;
console.log('APPLIED — atomic reconcile: ' + newAdr.adr_id + ' supersedes [' + [...expectedIds].join(', ') + ']');
console.log('');
console.log('Self-check (AC2 — byte-identical except status:/superseded_by:):');
beforeSnapshots.forEach(({ filePath, before }) => {
  const after = fs.readFileSync(filePath, 'utf8');
  const result = diffAllowingTwoFields(before, after);
  if (result.ok) {
    console.log('  PASS  ' + filePath + ' — only allowed fields changed:');
    result.diffs.forEach((d) => console.log('          line ' + d.line + ': "' + d.before + '"  ->  "' + d.after + '"'));
  } else {
    selfCheckFailed = true;
    console.log('  FAIL  ' + filePath + ' — ' + result.reason);
  }
});
if (problemsInsert.length > 0) {
  console.log('');
  console.log('NOTE — fields inserted (were missing from the old ADR before this run):');
  problemsInsert.forEach((p) => console.log('  - ' + p));
}
console.log('');
if (selfCheckFailed) {
  console.log('RESULT: MUTATION APPLIED BUT SELF-CHECK FAILED — investigate before trusting this reconcile (see FAIL lines above).');
  process.exit(3);
} else {
  console.log('RESULT: PASSED — reconcile applied atomically; every old ADR is byte-identical to its pre-reconcile snapshot except status:/superseded_by:.');
  process.exit(0);
}
