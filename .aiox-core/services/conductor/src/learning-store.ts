/**
 * learning-store.ts — F3 Channel-1 learning store helper (ADR-COCKPIT-LEARNING-TELEMETRY).
 *
 * The deterministic substrate for the project-local learning loop: path builders, the
 * relevance filter (Phase 0a), promotion candidates + promote (Phase 0b), and active-KB
 * read. Code, not LLM reasoning, for the mechanical steps — the skills stay the writers of
 * domain content; this is the shared, testable mechanism.
 *
 * Layout + schemas: .aiox-core/product/templates/learning/SCHEMA.md.
 *
 * Zero runtime deps: a targeted YAML reader/emitter for the KNOWN learning schema
 * (scalars, inline string arrays, one-level `context`/`epilogue`/`summary` blocks, and
 * `evidence` as a list of flat objects) — NOT a general YAML library.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LearningType = 'pattern' | 'anti-pattern' | 'gotcha' | 'heuristic';

export interface LearningContext {
  task_mode?: string | null;
  entity_type?: string | null;
  deploy_type?: string | null;
}

export interface DraftEntry {
  entry_id: string;
  skill_id: string;
  type: LearningType;
  status: 'draft' | 'promoted';
  created_at: string;
  promotion_score: number;
  context: LearningContext;
  tags: string[];
  statement: string;
  recommended_fix?: string;
  /** raw source path (set by readEntries; not part of the on-disk schema) */
  _path?: string;
}

export interface Heuristic {
  heuristic_id: string;
  type: LearningType;
  skill_scope: string[];
  context: LearningContext;
  tags: string[];
  statement: string;
  recommended_fix?: string;
  promoted_from?: string;
  promoted_at?: string;
}

/** The story facts the relevance filter matches against (Phase 0a). */
export interface StoryContext {
  task_mode?: string | null;
  entity_type?: string | null;
  deploy_type?: string | null;
  /** the skill's domain cross-cut tags, e.g. ['validation','draft-to-ready'] */
  tags?: string[];
}

export interface PromotionThresholds {
  pattern: number;
  'anti-pattern': number;
  gotcha: number;
  heuristic: number;
}

export const DEFAULT_THRESHOLDS: PromotionThresholds = {
  pattern: 3.5,
  'anti-pattern': 3.0,
  gotcha: 2.5,
  heuristic: 4.0,
};

export const DEFAULT_LEARNING_ROOT = '.aiox/learning';

// ---------------------------------------------------------------------------
// Path builders
// ---------------------------------------------------------------------------

export function logPath(root: string, skill: string, storyId: string, stamp: string): string {
  return join(root, 'logs', skill, `${skill}-${storyId}-${stamp}.yaml`);
}
export function entryPath(root: string, skill: string, entryId: string): string {
  return join(root, 'entries', skill, `${entryId}.yaml`);
}
/** The active-KB dirs, read as a union (promoted ∪ approved — synonyms by design). */
export function kbDirs(root: string): string[] {
  return [join(root, 'promoted'), join(root, 'approved')];
}

// ---------------------------------------------------------------------------
// Targeted YAML reader (decision fields only — NOT a general parser)
// ---------------------------------------------------------------------------

type Scalar = string | number | boolean | null;

function coerce(v: string): Scalar {
  const t = v.trim();
  if (t === '' || t === 'null' || t === '~') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t.replace(/^["']|["']$/g, '');
}

function parseInlineArray(v: string): string[] {
  const t = v.trim();
  if (!t.startsWith('[') || !t.endsWith(']')) return [];
  return t.slice(1, -1).split(',').map((x) => String(coerce(x)).trim()).filter((x) => x && x !== 'null');
}

function parseInlineObject(v: string): Record<string, Scalar> {
  const t = v.trim();
  const out: Record<string, Scalar> = {};
  if (!t.startsWith('{') || !t.endsWith('}')) return out;
  for (const pair of splitTopLevel(t.slice(1, -1))) {
    const ci = pair.indexOf(':');
    if (ci < 0) continue;
    out[pair.slice(0, ci).trim()] = coerce(pair.slice(ci + 1));
  }
  return out;
}

/** split on commas not inside nested [] or {} (one level is enough for our schema). */
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/**
 * Parse the decision fields from a learning YAML document. Handles top-level scalars,
 * inline arrays, inline `{...}` objects, and a 2-space-indented `context:` block.
 * Ignores fields it doesn't recognize (statement, evidence, …) — the writer owns those.
 */
export function parseLearningYaml(text: string): Record<string, Scalar | string[] | LearningContext> {
  const out: Record<string, Scalar | string[] | LearningContext> = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\S/.test(line) === false) continue; // skip indented lines (handled by their parent)
    const ci = line.indexOf(':');
    if (ci < 0) continue;
    const key = line.slice(0, ci).trim();
    const rest = line.slice(ci + 1).trim();

    if (key === 'context') {
      if (rest.startsWith('{')) { out.context = parseInlineObject(rest) as LearningContext; continue; }
      // block form: consume following 2-space-indented `k: v` lines
      const ctx: Record<string, Scalar> = {};
      let j = i + 1;
      for (; j < lines.length && /^\s{2,}\S/.test(lines[j]); j++) {
        const bl = lines[j].trim();
        if (!bl || bl.startsWith('#')) continue;
        const bci = bl.indexOf(':');
        if (bci < 0) continue;
        ctx[bl.slice(0, bci).trim()] = coerce(bl.slice(bci + 1));
      }
      out.context = ctx as LearningContext;
      i = j - 1;
      continue;
    }
    if (rest.startsWith('[')) { out[key] = parseInlineArray(rest); continue; }
    out[key] = coerce(rest);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Targeted YAML emitter (known schema only)
// ---------------------------------------------------------------------------

function emitScalar(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  return /[:#]|^\s|\s$/.test(s) ? JSON.stringify(s) : s;
}

function emitInlineArray(a: unknown[]): string {
  return `[${a.map((x) => emitScalar(x)).join(', ')}]`;
}

/**
 * Emit a learning record to YAML. Supports scalars, string arrays, one-level objects
 * (`context`/`epilogue`/`summary`) as indented blocks, and arrays of flat objects
 * (`evidence`) as inline `- { k: v }`. Covers the log/entry/heuristic schemas.
 */
export function emitLearningYaml(obj: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'object' && v[0] !== null) {
        lines.push(`${k}:`);
        for (const item of v as Record<string, unknown>[]) {
          const inner = Object.entries(item).map(([ik, iv]) => `${ik}: ${emitScalar(iv)}`).join(', ');
          lines.push(`  - { ${inner} }`);
        }
      } else {
        lines.push(`${k}: ${emitInlineArray(v)}`);
      }
    } else if (v !== null && typeof v === 'object') {
      lines.push(`${k}:`);
      for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) {
        lines.push(`  ${ik}: ${emitScalar(iv)}`);
      }
    } else {
      lines.push(`${k}: ${emitScalar(v)}`);
    }
  }
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

function listYaml(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort().map((f) => join(dir, f));
}

/** Read all draft entries for a skill (or all skills when skill omitted). */
export function readEntries(root: string, skill?: string): DraftEntry[] {
  const entriesDir = join(root, 'entries');
  if (!existsSync(entriesDir)) return [];
  const skills = skill ? [skill] : readdirSync(entriesDir).filter((d) => existsSync(join(entriesDir, d)));
  const out: DraftEntry[] = [];
  for (const s of skills) {
    for (const p of listYaml(join(entriesDir, s))) {
      const r = parseLearningYaml(readFileSync(p, 'utf-8'));
      out.push({
        entry_id: String(r.entry_id ?? ''),
        skill_id: String(r.skill_id ?? s),
        type: (r.type as LearningType) ?? 'pattern',
        status: (r.status as 'draft' | 'promoted') ?? 'draft',
        created_at: String(r.created_at ?? ''),
        promotion_score: typeof r.promotion_score === 'number' ? r.promotion_score : 0,
        context: (r.context as LearningContext) ?? {},
        tags: (r.tags as string[]) ?? [],
        statement: String(r.statement ?? ''),
        _path: p,
      });
    }
  }
  return out;
}

/** Read the active KB (promoted ∪ approved), de-duplicated by heuristic_id (promoted wins). */
export function readActiveKb(root: string): Heuristic[] {
  const byId = new Map<string, Heuristic>();
  for (const dir of kbDirs(root)) { // [promoted, approved] — promoted read first, approved does not overwrite
    for (const p of listYaml(dir)) {
      const r = parseLearningYaml(readFileSync(p, 'utf-8'));
      const id = String(r.heuristic_id ?? '');
      if (!id || byId.has(id)) continue;
      byId.set(id, {
        heuristic_id: id,
        type: (r.type as LearningType) ?? 'pattern',
        skill_scope: (r.skill_scope as string[]) ?? [],
        context: (r.context as LearningContext) ?? {},
        tags: (r.tags as string[]) ?? [],
        statement: String(r.statement ?? ''),
        promoted_from: r.promoted_from ? String(r.promoted_from) : undefined,
      });
    }
  }
  return [...byId.values()];
}

// ---------------------------------------------------------------------------
// Phase 0a — relevance filter (deterministic)
// ---------------------------------------------------------------------------

/**
 * A heuristic is relevant when its skill_scope admits the skill AND any context/tag axis
 * matches. `null`/empty heuristic context fields are wildcards (always match).
 */
export function relevanceFilter(heuristics: Heuristic[], story: StoryContext, skillId?: string): Heuristic[] {
  const storyTags = new Set(story.tags ?? []);
  return heuristics.filter((h) => {
    if (skillId && h.skill_scope.length > 0 && !h.skill_scope.includes(skillId)) return false;
    const axisMatch = (hv: string | null | undefined, sv: string | null | undefined) =>
      hv === null || hv === undefined || hv === '' ? false : hv === sv; // wildcard counts as "no positive signal"
    const ctxHit =
      axisMatch(h.context.task_mode, story.task_mode) ||
      axisMatch(h.context.entity_type, story.entity_type) ||
      axisMatch(h.context.deploy_type, story.deploy_type);
    const tagHit = h.tags.some((t) => storyTags.has(t));
    // a fully-wildcard heuristic (no positive context, no shared tag) is relevant by default
    const hasAnyContext = [h.context.task_mode, h.context.entity_type, h.context.deploy_type].some((x) => x);
    if (!hasAnyContext && h.tags.length === 0) return true;
    return ctxHit || tagHit;
  });
}

// ---------------------------------------------------------------------------
// Phase 0b — promotion (deterministic threshold + the move)
// ---------------------------------------------------------------------------

/** Draft entries whose score crosses the per-type threshold (the human then approves). */
export function promotionCandidates(entries: DraftEntry[], thresholds: PromotionThresholds = DEFAULT_THRESHOLDS): DraftEntry[] {
  return entries.filter((e) => e.status === 'draft' && e.promotion_score >= (thresholds[e.type] ?? Infinity));
}

/**
 * Promote a draft entry: write the active-KB heuristic to `promoted/`, mark the source entry
 * `status: promoted` (never delete — audit). Caller passes the human-approved entry + timestamp.
 */
export function promote(root: string, entry: DraftEntry, promotedAt: string): Heuristic {
  const heuristic: Heuristic = {
    heuristic_id: entry.entry_id.replace(/-\d{8}$/, ''), // strip trailing date stamp if present
    type: entry.type,
    skill_scope: [entry.skill_id],
    context: entry.context,
    tags: entry.tags,
    statement: entry.statement,
    recommended_fix: entry.recommended_fix,
    promoted_from: entry.entry_id,
    promoted_at: promotedAt,
  };
  const outPath = join(root, 'promoted', `${heuristic.heuristic_id}.yaml`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `schema_version: "1.0"\n` + emitLearningYaml(heuristic as unknown as Record<string, unknown>), 'utf-8');

  // mark the source entry promoted (rewrite the status: line, preserve the rest)
  if (entry._path && existsSync(entry._path)) {
    const src = readFileSync(entry._path, 'utf-8');
    const next = /^status:\s*.*$/m.test(src)
      ? src.replace(/^status:\s*.*$/m, 'status: promoted')
      : src + '\nstatus: promoted\n';
    writeFileSync(entry._path, next, 'utf-8');
  }
  return heuristic;
}

// ---------------------------------------------------------------------------
// Phase 7 — write an execution log
// ---------------------------------------------------------------------------

export interface ExecutionLog {
  skill_id: string;
  story_id: string;
  timestamp: string;
  outcome: 'passed' | 'failed' | 'halted';
  summary?: Record<string, unknown>;
  enrichment_applied?: boolean;
  epilogue?: { what_worked: string; what_failed: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' };
  source_type?: string;
}

/** Write a Phase-7 execution log. Best-effort by contract — callers warn, never HALT, on failure. */
export function writeLog(root: string, stamp: string, log: ExecutionLog): string {
  const p = logPath(root, log.skill_id, log.story_id, stamp);
  mkdirSync(dirname(p), { recursive: true });
  const doc = { schema_version: '1.0', source_type: 'skill_execution', ...log };
  writeFileSync(p, emitLearningYaml(doc as unknown as Record<string, unknown>), 'utf-8');
  return p;
}
