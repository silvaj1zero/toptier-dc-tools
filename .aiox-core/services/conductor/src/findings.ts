/**
 * findings.ts — F7b normalized findings (ADR-COCKPIT-ENGINE-REGISTRY D4).
 *
 * The contract every consumer (/self-heal, /apply-qa-fixes, /review) reads: a single
 * normalized finding shape across heterogeneous engines, with cross-engine dedupe + agreement
 * (two engines flagging the same issue → one finding, higher confidence). Pure functions.
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const SEVERITY_ORDER: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export interface RawFinding {
  file: string;
  line: number;
  /** the engine's native severity token (mapped via the engine's severity_map). */
  severity: string;
  message: string;
}

export interface NormalizedFinding {
  engine: string;
  file: string;
  line: number;
  severity: Severity;
  message: string;
  /** engines that independently reported this same finding (set on dedupe; ≥1). */
  agreed_by: string[];
}

const CANON: Record<string, Severity> = { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };

/**
 * Map an engine's native severity → the 4-level scale. Order: explicit per-engine severity_map →
 * canonical name match → conservative default HIGH (an unmapped finding is treated as significant,
 * never silently downgraded to LOW).
 */
export function normalizeSeverity(native: string, severityMap?: Record<string, string>): Severity {
  const mapped = severityMap?.[native];
  if (mapped && mapped.toUpperCase() in SEVERITY_ORDER) return mapped.toUpperCase() as Severity;
  const canon = CANON[String(native).toLowerCase()];
  if (canon) return canon;
  return 'HIGH';
}

/** Normalize one raw finding from an engine into the shared shape. */
export function normalizeFinding(raw: RawFinding, engine: string, severityMap?: Record<string, string>): NormalizedFinding {
  return {
    engine,
    file: raw.file,
    line: raw.line,
    severity: normalizeSeverity(raw.severity, severityMap),
    message: raw.message,
    agreed_by: [engine],
  };
}

function normMsg(m: string): string {
  return m.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * D4 — dedupe across engines by (file, line, normalized-message). The merged finding keeps the
 * HIGHEST severity reported, and `agreed_by` lists every engine that flagged it (agreement = confidence).
 * Stable order: first-seen wins position.
 */
export function dedupeFindings(findings: NormalizedFinding[]): NormalizedFinding[] {
  const byKey = new Map<string, NormalizedFinding>();
  for (const f of findings) {
    const key = `${f.file}::${f.line}::${normMsg(f.message)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...f, agreed_by: [...new Set(f.agreed_by)] });
      continue;
    }
    // merge: highest severity wins; union the agreeing engines
    if (SEVERITY_ORDER[f.severity] > SEVERITY_ORDER[existing.severity]) existing.severity = f.severity;
    existing.agreed_by = [...new Set([...existing.agreed_by, ...f.agreed_by, f.engine])];
  }
  return [...byKey.values()];
}

/** CRITICAL/HIGH subset — the blocking findings the self-heal loop must clear before PASS. */
export function blockingFindings(findings: NormalizedFinding[]): NormalizedFinding[] {
  return findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
}

/** Count findings by severity (the Channel-2 run-signal summary — no code/message content). */
export function severityCounts(findings: NormalizedFinding[]): Record<Severity, number> {
  const c: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const f of findings) c[f.severity]++;
  return c;
}

export type Verdict = 'PASS' | 'CONCERNS' | 'FAIL';

/**
 * Deterministic finding-level verdict — backs /review's gate-decision rule 4 (the severity rung):
 * any CRITICAL/HIGH → FAIL; any MEDIUM → CONCERNS; else PASS. (The full /review verdict also
 * factors hard-gates, NFRs, and risk; this is the mechanical severity floor over the finding set.)
 */
export function verdictFromFindings(findings: NormalizedFinding[]): Verdict {
  const c = severityCounts(findings);
  if (c.CRITICAL > 0 || c.HIGH > 0) return 'FAIL';
  if (c.MEDIUM > 0) return 'CONCERNS';
  return 'PASS';
}
