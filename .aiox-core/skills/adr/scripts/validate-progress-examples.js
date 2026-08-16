#!/usr/bin/env node
/**
 * ADR Progress Schema — mechanical validation (Story 006.W1.2, AC8; QA-1 regression).
 *
 * Validates the canonical fixtures against data/adr-progress-schema.json via ajv
 * (draft 2020-12), and asserts the EXPECTED outcome for each:
 *   - adr-progress.example.json                  → MUST validate (PASS)
 *   - adr-progress.invalid-example.json          → MUST fail validation (FAIL), and the
 *                                                   failure MUST include all 3 deliberate
 *                                                   violations: missing required
 *                                                   (active_mode), phase.current out of
 *                                                   0-7, reconcile_policy non-enumerated.
 *   - adr-progress.invalid-phase-without-gate.json → MUST fail validation (FAIL) — QA-1
 *                                                   regression (2026-07-07 /review): proves
 *                                                   `phase` without `gate` is rejected now
 *                                                   that `gate` is in phase.required (AC3 —
 *                                                   phase.gate.ack_ref must be universally
 *                                                   addressable for AC4's disk-wins to hold).
 *
 * Exit code 0 = all fixtures behaved as expected (schema genuinely restricts, not decorative).
 * Exit code 1 = any fixture behaved unexpectedly (schema regression).
 *
 * Usage: node validate-progress-examples.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const DIR = __dirname;
const SCHEMA_PATH = path.join(DIR, '../data/adr-progress-schema.json');
const VALID_PATH = path.join(DIR, '../data/adr-progress.example.json');
const INVALID_PATH = path.join(DIR, '../data/adr-progress.invalid-example.json');
const INVALID_PHASE_WITHOUT_GATE_PATH = path.join(DIR, '../data/adr-progress.invalid-phase-without-gate.json');

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: false });
addFormats(ajv);
const validate = ajv.compile(schema);

let exitCode = 0;

function report(label, expected, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const ok = validate(data);
  console.log('--- ' + label + ' (' + path.relative(process.cwd(), filePath) + ') ---');
  console.log('expected: ' + expected + ' | actual: ' + (ok ? 'PASS' : 'FAIL'));
  if (ok) {
    console.log('  -> validates cleanly against adr-progress-v1');
  } else {
    validate.errors.forEach((e, i) => {
      console.log('  ' + (i + 1) + '. [' + e.keyword + '] ' + (e.instancePath || '/') + ' :: ' + e.message +
        (e.params ? ' ' + JSON.stringify(e.params) : ''));
    });
  }
  const actual = ok ? 'PASS' : 'FAIL';
  if (actual !== expected) {
    console.log('  !! UNEXPECTED — schema regression (expected ' + expected + ', got ' + actual + ')');
    exitCode = 1;
  }
  console.log('');
  return { ok, errors: validate.errors || [] };
}

const validResult = report('VALID fixture', 'PASS', VALID_PATH);
const invalidResult = report('INVALID fixture', 'FAIL', INVALID_PATH);
const phaseWithoutGateResult = report('INVALID fixture — phase without gate (QA-1 regression)', 'FAIL', INVALID_PHASE_WITHOUT_GATE_PATH);

if (!validResult.ok) {
  exitCode = 1;
}
if (phaseWithoutGateResult.ok) {
  console.log('  !! QA-1 REGRESSION — phase without `gate` validated cleanly; `gate` must be in phase.required (AC3/AC4).');
  exitCode = 1;
} else {
  const gateMsgs = phaseWithoutGateResult.errors.map((e) => (e.instancePath || '') + ' ' + e.keyword + ' ' + e.message).join(' | ');
  const gateFound = /required.*'gate'|'gate'.*required/i.test(gateMsgs);
  console.log('--- QA-1 regression coverage check (phase-without-gate fixture) ---');
  console.log('  [' + (gateFound ? 'x' : ' ') + '] missing required (phase.gate)');
  console.log('');
  if (!gateFound) exitCode = 1;
}
if (invalidResult.ok) {
  exitCode = 1;
} else {
  // Assert the 3 deliberate violations are all present in the FAIL output (AC8 evidence).
  const msgs = invalidResult.errors.map((e) => (e.instancePath || '') + ' ' + e.keyword + ' ' + e.message).join(' | ');
  const checks = [
    { name: 'missing required (active_mode)', re: /required.*active_mode|active_mode.*required/i },
    { name: 'phase.current out of 0-7', re: /\/phase\/current.*maximum|maximum.*7/i },
    { name: 'reconcile_policy non-enumerated', re: /\/reconcile_policy.*(const|enum)/i },
  ];
  console.log('--- AC8 violation coverage check (INVALID fixture) ---');
  checks.forEach((c) => {
    const found = c.re.test(msgs);
    console.log('  [' + (found ? 'x' : ' ') + '] ' + c.name);
    if (!found) exitCode = 1;
  });
  console.log('');
}

console.log(exitCode === 0
  ? 'RESULT: PASS — schema genuinely restricts (valid example validates, invalid example fails for the 3 expected reasons).'
  : 'RESULT: FAIL — see UNEXPECTED / missing-check lines above.');
process.exit(exitCode);
