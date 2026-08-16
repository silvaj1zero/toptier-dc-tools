/**
 * engine-registry.ts — F7a multi-CLI engine registry (ADR-COCKPIT-ENGINE-REGISTRY).
 *
 * Review engines are the project's configured CLIs, resolved at runtime (agnostic binding).
 * This module is the deterministic substrate the /self-heal loop routes over: load the
 * registry (config ∪ bundled), probe availability, and select reviewers with no-self-review
 * ENFORCED IN CODE (D3). The actual review/parse invocation is the adapter's runtime concern.
 *
 * Zero runtime deps (the default prober uses node:child_process; it is injectable for tests/headless).
 */

import { execSync } from 'node:child_process';

export type EngineRole = 'driver' | 'reviewer' | 'long-context';

export interface EngineConfig {
  id: string;
  role: EngineRole;
  /** availability probe command; success (exit 0) → the engine routes. Default `command -v <id>`. */
  detect?: string;
  /** how to invoke a review on a diff (adapter runtime concern; not executed here). */
  review?: string;
  /** parser id for the engine's output → normalized findings (adapter runtime concern). */
  parse?: string;
  /** native severity → normalized severity map (consumed by findings.ts). */
  severity_map?: Record<string, string>;
}

/**
 * Bundled default adapter set (D6). `claude` is the driver (always present, detect=true);
 * the rest probe for the CLI on PATH. A project overrides/extends these via aiox.config.json → engines[].
 */
export const BUNDLED_ENGINES: EngineConfig[] = [
  { id: 'claude', role: 'driver', detect: 'true' },
  { id: 'codex', role: 'reviewer', detect: 'command -v codex', review: 'codex review --diff -', parse: 'codex-json', severity_map: { error: 'CRITICAL', warning: 'HIGH', note: 'MEDIUM' } },
  { id: 'gemini', role: 'long-context', detect: 'command -v gemini' },
  { id: 'coderabbit', role: 'reviewer', detect: 'command -v coderabbit', review: 'coderabbit review --plain', parse: 'coderabbit', severity_map: { potential_issue: 'HIGH', improvement: 'MEDIUM' } },
];

/** Probe contract: returns true iff the engine is available. Injectable for tests/headless. */
export type Prober = (detectCmd: string) => boolean;

/** Default prober: run the detect command; exit 0 → available. Never throws (any error → unavailable). */
export const defaultProber: Prober = (detectCmd: string) => {
  try {
    execSync(detectCmd, { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

export interface EnginesConfigShape {
  engines?: EngineConfig[];
}

/**
 * Load the registry: the project's engines[] (from aiox.config.json) UNIONED with the bundled
 * set — a config entry overrides a bundled one by id; new ids are added. Order: config entries
 * first (project intent leads), then bundled engines not already present.
 */
export function loadEngines(config?: EnginesConfigShape): EngineConfig[] {
  const configured = config?.engines ?? [];
  const byId = new Map<string, EngineConfig>();
  for (const e of configured) byId.set(e.id, e);
  const out: EngineConfig[] = [...configured];
  for (const b of BUNDLED_ENGINES) {
    if (!byId.has(b.id)) out.push(b);
  }
  return out;
}

/** Engines whose `detect` probe succeeds (default detect = `command -v <id>`). */
export function probeAvailable(engines: EngineConfig[], probe: Prober = defaultProber): EngineConfig[] {
  return engines.filter((e) => probe(e.detect ?? `command -v ${e.id}`));
}

export interface ReviewerSelection {
  reviewers: EngineConfig[];
  /** true when no non-writer reviewer is available → caller must SKIP + blind-spot warn. */
  blindSpot: boolean;
  writer: string;
}

/**
 * D3 (NON-NEGOTIABLE) — select the reviewer set with NO-SELF-REVIEW enforced in code:
 * available reviewer-role engines MINUS the writer. Empty set → blindSpot (caller SKIPs;
 * NEVER lets the writer grade its own diff, NEVER fabricates a review).
 */
export function selectReviewers(availableEngines: EngineConfig[], writerId: string): ReviewerSelection {
  const reviewers = availableEngines.filter((e) => e.role === 'reviewer' && e.id !== writerId);
  return { reviewers, blindSpot: reviewers.length === 0, writer: writerId };
}

/** Engines available for long-context routing (/three-brain "eyes"), writer excluded. */
export function selectLongContext(availableEngines: EngineConfig[], writerId: string): EngineConfig[] {
  return availableEngines.filter((e) => e.role === 'long-context' && e.id !== writerId);
}
