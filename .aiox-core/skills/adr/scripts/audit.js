#!/usr/bin/env node
/**
 * ADR Audit — mechanical corpus health checks (Story 006.W3.1, AC4/AC5).
 *
 * Runs the 3 checks `playbook.md`'s "Practices" #1/#3/#5 + this story's AC4/AC5 describe, against
 * either a single ADR file or a whole directory of them. Report-only — never mutates a file, never
 * auto-merges/auto-fixes anything (VC-1: a merge candidate is a SUGGESTION for a human to run
 * `reconcile.js` against, never an automatic action).
 *
 * (a) ENFORCEMENT-COVERAGE INVARIANT (playbook.md practice #1, adr-template.md §2.2 rule) — every
 *     ADR whose status is APPROVED/ACCEPTED must have, for each decision, either a non-empty
 *     `enforced_by[]` OR an explicit `confirmation` field. A decision with `enforced_by: []` and no
 *     `confirmation` is a silent gap.
 *
 * (b) MERGE CANDIDATES (VC-1 heuristic, documented limitation: false-negatives acceptable,
 *     false-positives must be human-checkable, never auto-merged) — two independent signals, either
 *     one is enough to flag a pair as a candidate:
 *       - Mutual `complements[]` — A complements B AND B complements A (a reciprocal link is a much
 *         stronger signal than a one-directional "extends" relationship).
 *       - `applies_to_paths[]` overlap above a threshold — >=50% of the smaller ADR's paths (by glob
 *         string, not by actually resolving the glob against the filesystem — a textual-overlap
 *         heuristic, not a full glob-intersection engine) also appear in the other ADR's list, AND
 *         at least 2 paths actually overlap (not just 1) OR the smaller list has >=3 entries. This
 *         second guard was added after the real smoke run against this repo's own corpus (see the
 *         story's Dev Agent Record) surfaced a concrete false-positive class: many unrelated ADRs
 *         each declare only 2 broad crate-root globs (e.g. "crates/aiox-core/**" +
 *         "crates/aiox-cockpit/**"), which trivially "overlap 100%" between any two of them without
 *         being a real merge candidate — a single shared coarse glob is not a real signal, 2+ shared
 *         globs (or a longer, more specific overlapping list) is.
 *     Both signals are heuristics over the SAME-status subset (only ADRs that are both
 *     APPROVED/ACCEPTED/PROPOSED are compared — a SUPERSEDED/DEPRECATED/REJECTED ADR is never
 *     offered as a merge candidate, it is already resolved).
 *
 * (c) STALENESS (VC-2 threshold, documented rationale below) — an ADR is flagged stale when BOTH:
 *       - status is APPROVED/ACCEPTED (a PROPOSED/DRAFT ADR isn't "stale", it's just unfinished —
 *         staleness is about a RATIFIED decision nobody has revisited, not a draft in progress), AND
 *       - no `change_history[]` entry (or the ADR's own `date`, when change_history[] is empty/absent)
 *         is within the last STALE_THRESHOLD_DAYS of "now" (audit run time).
 *     STALE_THRESHOLD_DAYS = 180 (~6 months). Rationale (VC-2, @master decision, documented not
 *     invented): the research's own AWS citation ("2-3 sprints to stabilize in greenfield") is about
 *     a DIFFERENT concern (early-stage churn immediately after ratification), not a universal
 *     staleness cadence — there is no direct precedent for "how old is too old to have gone
 *     unreviewed" in this ADR or its research. 180 days is chosen because it is long enough that a
 *     6-month-untouched APPROVED decision governing live paths (`applies_to_paths[]`) is a
 *     reasonable trigger for "someone should re-look at this", while short enough to catch drift
 *     before an ADR becomes ancient. This is a starting default, adjustable later with real
 *     operating data — not claimed to be precisely calibrated.
 *
 * AC5 — ADR-DEBT DETECTION (research item 14, "AWS non-compliant -> technical-debt task"): for every
 * APPROVED/ACCEPTED ADR, check whether every glob in `applies_to_paths[]` resolves to at least one
 * real file in the repo (a lightweight existence check, not a full compliance/behavior audit — see
 * the story's own scope note: "@master decides the mechanism ... can be as simple as verifying
 * applies_to_paths[] still exist"). A path that resolves to ZERO files is named as an explicit
 * ADR-debt candidate in the report ("code has drifted from an APPROVED ADR") — the audit NEVER
 * silently ignores it, it surfaces it as a pending item the human should turn into a story/backlog
 * entry (this script does not create that story itself — that step is a human/orchestrator action).
 *
 * Usage:
 *   node audit.js <path-to-adr.md-or-directory> [--stale-days=180]
 *
 * Exit codes:
 *   0 = audit ran to completion (report printed) — exit 0 regardless of findings; audit REPORTS,
 *       it never fails the run for findings alone (there is nothing to "fail" — it's not a gate).
 *   2 = usage/IO error (bad path)
 */
'use strict';
const fs = require('fs');
const path = require('path');

function usageError(msg) {
  console.error('ERROR: ' + msg);
  console.error('Usage: node audit.js <path-to-adr.md-or-directory> [--stale-days=180]');
  process.exit(2);
}

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
if (!target) usageError('missing <path-to-adr.md-or-directory>');
const staleDaysArg = args.find((a) => a.startsWith('--stale-days='));
const STALE_THRESHOLD_DAYS = staleDaysArg ? parseInt(staleDaysArg.split('=')[1], 10) : 180;

if (!fs.existsSync(target)) usageError('path does not exist: ' + target);

function listAdrFiles(p) {
  const stat = fs.statSync(p);
  if (stat.isFile()) return [p];
  return fs.readdirSync(p)
    .filter((f) => f.startsWith('ADR-') && f.endsWith('.md'))
    .map((f) => path.join(p, f));
}

const files = listAdrFiles(target);
if (files.length === 0) usageError('no ADR-*.md files found at ' + target);

function readFrontmatterRaw(filePath) {
  // Normalize CRLF -> LF for parsing purposes only (this script is read-only / report-only, it
  // never writes a file back, so normalizing line endings in memory is safe here — unlike
  // reconcile.js, which must preserve the original bytes exactly for its byte-diff self-check).
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  return m[1];
}

function fmField(fmText, key) {
  const re = new RegExp('^' + key + ':\\s*(.*)$', 'm');
  const m = fmText.match(re);
  return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : null;
}

function stripQuotes(s) {
  return s.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

function fmListField(fmText, key) {
  const inline = fmField(fmText, key);
  if (inline !== null && inline.startsWith('[')) {
    return inline.replace(/^\[|\]$/g, '').split(',').map((s) => stripQuotes(s.trim())).filter(Boolean);
  }
  const blockRe = new RegExp('^' + key + ':\\s*\\n((?:^\\s*-\\s*.+\\n?)*)', 'm');
  const m = fmText.match(blockRe);
  if (!m) return [];
  return m[1].split('\n').map((l) => stripQuotes(l.replace(/^\s*-\s*/, '').trim())).filter(Boolean);
}

/** Parses the `decisions:` block into [{id, enforced_by: [], confirmation}]. Handles the common
 * indented-block shape this repo's ADRs use; a decision this regex can't parse is reported as
 * "unparseable" rather than silently skipped (No-Invention — never assume a decision is fine when
 * it couldn't actually be read). */
function parseDecisions(fmText) {
  // Capture from `decisions:` to the next line that starts a new top-level key at column 0
  // (word-char immediately followed by `:` — never matched by an indented continuation line like
  // `    summary: ...`), or to the true end of fmText. NOTE: the lookahead deliberately uses
  // `$(?![\s\S])` rather than a bare `$` — under the `/m` flag a bare `$` matches at EVERY line
  // ending, so a lazy `[\s\S]*?` would stop after the block's very first line (confirmed by a real
  // repro against this repo's own fixture during this story's smoke test — see Dev Agent Record).
  // `$(?![\s\S])` only matches true end-of-string, which is what "or to the end of fmText" means.
  const blockMatch = fmText.match(/^decisions:\s*\n([\s\S]*?)(?=\n\w[\w-]*:|$(?![\s\S]))/m);
  if (!blockMatch) return { decisions: [], unparseable: false };
  const block = blockMatch[1];
  const entries = block.split(/\n(?=\s*-\s*id:)/).filter((s) => s.trim());
  const decisions = entries.map((entry) => {
    const idM = entry.match(/id:\s*(\S+)/);
    const enforcedM = entry.match(/enforced_by:\s*(\[[^\]]*\])/);
    const confM = entry.match(/confirmation:\s*(\S+)/);
    return {
      id: idM ? idM[1] : '(unparseable)',
      enforced_by_raw: enforcedM ? enforcedM[1] : null,
      confirmation: confM ? confM[1] : null,
    };
  });
  return { decisions, unparseable: decisions.some((d) => d.id === '(unparseable)') };
}

function isEnforcedByEmpty(raw) {
  if (raw === null) return true; // no enforced_by: line at all found for this decision
  return raw.replace(/\s/g, '') === '[]';
}

/** Textual overlap of two glob-string lists (no filesystem glob resolution — a heuristic on the
 * strings themselves, exact-match after trim). Returns {ratio, count} against the smaller list. */
function pathOverlap(a, b) {
  if (a.length === 0 || b.length === 0) return { ratio: 0, count: 0 };
  const setB = new Set(b);
  const count = a.filter((p) => setB.has(p)).length;
  const smaller = Math.min(a.length, b.length);
  return { ratio: count / smaller, count, smaller };
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** change_history[] entries: [{date, author, change}] — extracts just the dates present. Same
 * block-capture shape as parseDecisions() above, including the `$(?![\s\S])` end-of-string
 * lookahead fix (see its comment — a bare `$` under `/m` truncates after the block's first line). */
function changeHistoryDates(fmText) {
  const blockMatch = fmText.match(/^change_history:\s*\n([\s\S]*?)(?=\n\w[\w-]*:|$(?![\s\S]))/m);
  if (!blockMatch) return [];
  const dates = [...blockMatch[1].matchAll(/date:\s*(\S+)/g)].map((m) => parseDate(m[1])).filter(Boolean);
  return dates;
}

// --- Load all ADRs ---
const adrs = files.map((filePath) => {
  const fmText = readFrontmatterRaw(filePath);
  if (fmText === null) return { filePath, error: 'no frontmatter block' };
  const adr_id = fmField(fmText, 'adr_id') || path.basename(filePath, '.md');
  const status = fmField(fmText, 'status') || '(missing)';
  const date = fmField(fmText, 'date');
  const complements = fmListField(fmText, 'complements');
  const applies_to_paths = fmListField(fmText, 'applies_to_paths');
  const { decisions, unparseable } = parseDecisions(fmText);
  const changeDates = changeHistoryDates(fmText);
  return { filePath, adr_id, status, date, complements, applies_to_paths, decisions, unparseable, changeDates };
});

const loadable = adrs.filter((a) => !a.error);
const failedToLoad = adrs.filter((a) => a.error);

console.log('=== ADR AUDIT — ' + target + ' (' + files.length + ' file(s), stale threshold=' + STALE_THRESHOLD_DAYS + 'd) ===\n');

if (failedToLoad.length > 0) {
  console.log('LOAD ERRORS (' + failedToLoad.length + '):');
  failedToLoad.forEach((a) => console.log('  - ' + a.filePath + ': ' + a.error));
  console.log('');
}

// --- (a) Enforcement-coverage invariant ---
console.log('--- (a) Enforcement-coverage invariant ---');
const RATIFIED = new Set(['APPROVED', 'ACCEPTED']);
let coverageGaps = 0;
loadable.forEach((a) => {
  if (!RATIFIED.has(a.status)) return;
  if (a.unparseable) {
    console.log('  ? ' + a.adr_id + ' — decisions[] block could not be fully parsed; skipped (report as unparseable, not silently passed)');
    return;
  }
  a.decisions.forEach((d) => {
    if (isEnforcedByEmpty(d.enforced_by_raw) && !d.confirmation) {
      coverageGaps++;
      console.log('  GAP  ' + a.adr_id + ' ' + d.id + ' — enforced_by: [] with no confirmation field (status=' + a.status + ')');
    }
  });
});
if (coverageGaps === 0) console.log('  none — every APPROVED/ACCEPTED decision has enforced_by[] or an explicit confirmation.');
console.log('  Total gaps: ' + coverageGaps + '\n');

// --- (b) Merge candidates ---
console.log('--- (b) Merge candidates (heuristic — human-checkable suggestions, never auto-merged) ---');
const comparable = loadable.filter((a) => !TERMINAL(a.status));
function TERMINAL(status) { return status === 'SUPERSEDED' || status === 'DEPRECATED' || status === 'REJECTED'; }
let candidateCount = 0;
for (let i = 0; i < comparable.length; i++) {
  for (let j = i + 1; j < comparable.length; j++) {
    const a = comparable[i], b = comparable[j];
    const mutualComplements = a.complements.includes(b.adr_id) && b.complements.includes(a.adr_id);
    const overlap = pathOverlap(a.applies_to_paths, b.applies_to_paths);
    // Guard against the generic-coarse-glob false-positive class (see header comment): a single
    // shared broad glob is not a real signal — require >=2 shared paths, or a smaller list with
    // >=3 entries (so a high ratio on a longer, more specific list still counts).
    const pathSignal = overlap.ratio >= 0.5 && (overlap.count >= 2 || overlap.smaller >= 3);
    if (mutualComplements || pathSignal) {
      candidateCount++;
      const signals = [];
      if (mutualComplements) signals.push('mutual complements[]');
      if (pathSignal) signals.push('applies_to_paths[] overlap ' + Math.round(overlap.ratio * 100) + '% (' + overlap.count + ' shared path(s))');
      console.log('  CANDIDATE  ' + a.adr_id + ' <-> ' + b.adr_id + ' — signal(s): ' + signals.join(', '));
    }
  }
}
if (candidateCount === 0) console.log('  none found.');
console.log('  Total candidates: ' + candidateCount + '\n');

// --- (c) Staleness ---
console.log('--- (c) Staleness (threshold=' + STALE_THRESHOLD_DAYS + ' days, APPROVED/ACCEPTED only) ---');
const now = new Date();
let staleCount = 0;
loadable.forEach((a) => {
  if (!RATIFIED.has(a.status)) return;
  const mostRecent = a.changeDates.length > 0
    ? new Date(Math.max(...a.changeDates.map((d) => d.getTime())))
    : parseDate(a.date);
  if (!mostRecent) {
    console.log('  ?    ' + a.adr_id + ' — no parseable date/change_history[] to evaluate staleness from');
    return;
  }
  const ageDays = Math.floor((now - mostRecent) / (1000 * 60 * 60 * 24));
  if (ageDays > STALE_THRESHOLD_DAYS) {
    staleCount++;
    console.log('  STALE  ' + a.adr_id + ' — last touched ' + ageDays + 'd ago (' + mostRecent.toISOString().slice(0, 10) + ')');
  }
});
if (staleCount === 0) console.log('  none — every APPROVED/ACCEPTED ADR was touched within ' + STALE_THRESHOLD_DAYS + ' days.');
console.log('  Total stale: ' + staleCount + '\n');

// --- AC5 ADR-debt: applies_to_paths[] existence check ---
console.log('--- ADR-debt (AC5) — applies_to_paths[] glob resolves to zero files ---');
const repoRoot = process.cwd();
function globHasMatch(pattern) {
  // Lightweight existence check: strip a trailing /** or wildcard segment and check the directory
  // exists, OR — for a literal (no wildcard) path — check the exact file/dir exists. This is
  // deliberately NOT a full glob engine (out of appetite — AC5 only asks for "as simple as
  // verifying applies_to_paths[] still exist"); it errs toward NOT flagging a real glob as debt
  // (false-negative-safe), consistent with VC-1's stated preference for the audit overall.
  if (!pattern.includes('*')) {
    return fs.existsSync(path.join(repoRoot, pattern));
  }
  const base = pattern.split('*')[0].replace(/\/$/, '');
  if (base === '') return true; // pattern is too broad to meaningfully check (e.g. "**") — skip
  return fs.existsSync(path.join(repoRoot, base));
}
let debtCount = 0;
loadable.forEach((a) => {
  if (!RATIFIED.has(a.status)) return;
  a.applies_to_paths.forEach((p) => {
    if (!globHasMatch(p)) {
      debtCount++;
      console.log('  DEBT  ' + a.adr_id + ' — applies_to_paths "' + p + '" resolves to zero files on disk (code may have drifted from this APPROVED decision)');
    }
  });
});
if (debtCount === 0) console.log('  none — every APPROVED/ACCEPTED ADR\'s applies_to_paths[] still resolves on disk.');
console.log('  Total ADR-debt candidates: ' + debtCount);
if (debtCount > 0) {
  console.log('  ACTION REQUIRED (AC5): name each DEBT line above as an explicit backlog/story item — never silently ignore it.');
}
console.log('');

console.log('=== SUMMARY: ' + coverageGaps + ' coverage gap(s), ' + candidateCount + ' merge candidate(s), ' + staleCount + ' stale ADR(s), ' + debtCount + ' ADR-debt candidate(s) ===');
process.exit(0);
