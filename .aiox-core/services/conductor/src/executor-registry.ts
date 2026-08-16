/**
 * executor-registry.ts — F9a registry generator/loader (ADR-COCKPIT-AGENT-SELECTION D1/D2/D5).
 *
 * The agent frontmatter is the SOT (D1). This module GENERATES the registry cache
 * (.aiox/cache/executors.json) by globbing .aiox-core/agents/*.md, parsing the F9
 * selection metadata, and applying the per-project .aiox-project overlay (D5). The
 * cache is a projection — never hand-authored (D2).
 *
 * Zero runtime deps: a minimal frontmatter parser for the known F9 fields (inline
 * arrays + scalars) — NOT a general YAML parser.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

import type { Executor, ExecutorRegistry } from './executor-selector.ts';

const REQUIRED_FIELDS = ['capabilities', 'domains', 'authority', 'wip_limit', 'escalation'] as const;

interface ParsedFrontmatter {
  name?: string;
  capabilities?: string[];
  domains?: string[];
  authority?: string[];
  wip_limit?: number;
  escalation?: string;
}

/**
 * Minimal frontmatter parser — extracts ONLY the F9 fields (+ name) from the leading
 * `---` block. Inline arrays `[a, b]` → string[]; integers → number; else string.
 * Comment (`#`) and blank lines skipped. Not a general YAML parser by design.
 */
export function parseFrontmatter(md: string): ParsedFrontmatter | null {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out: ParsedFrontmatter = {};
  for (const raw of m[1].split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const ci = line.indexOf(':');
    if (ci < 0) continue;
    const key = line.slice(0, ci).trim();
    let val = line.slice(ci + 1).trim();
    if (key === 'name') { out.name = stripQuotes(val); continue; }
    if (key === 'escalation') { out.escalation = stripQuotes(val); continue; }
    if (key === 'wip_limit') { const n = Number(val); if (Number.isFinite(n)) out.wip_limit = n; continue; }
    if (key === 'capabilities' || key === 'domains' || key === 'authority') {
      out[key] = parseInlineArray(val);
      continue;
    }
  }
  return out;
}

function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, '');
}

function parseInlineArray(val: string): string[] {
  const t = val.trim();
  if (!t.startsWith('[') || !t.endsWith(']')) return [];
  return t.slice(1, -1).split(',').map((x) => stripQuotes(x.trim())).filter(Boolean);
}

/** An agent is a selectable EXECUTOR iff it declares ALL F9 fields (CHIEFs do not). */
export function isExecutorFrontmatter(fm: ParsedFrontmatter | null): boolean {
  if (!fm || !fm.name) return false;
  return REQUIRED_FIELDS.every((f) => fm[f] !== undefined);
}

export interface OverlayEntry {
  'domains+'?: string[];
  'capabilities+'?: string[];
  wip_limit?: number;
  status?: Executor['status'];
}
export type Overlay = Record<string, OverlayEntry>;

/** D5 — merge a per-project overlay entry into a base executor (additive for arrays). */
function applyOverlay(base: Executor, ov: OverlayEntry | undefined): Executor {
  if (!ov) return base;
  const union = (a: string[], b?: string[]) => (b ? [...new Set([...a, ...b])] : a);
  return {
    ...base,
    domains: union(base.domains, ov['domains+']),
    capabilities: union(base.capabilities, ov['capabilities+']),
    wip_limit: ov.wip_limit ?? base.wip_limit,
    status: ov.status ?? base.status,
  };
}

export interface BuildOptions {
  /** Directory of agent .md files (SOT). Default: <repo>/.aiox-core/agents */
  agentsDir: string;
  /** Optional path to the per-project overlay JSON (.aiox-project/executors-overlay.json). */
  overlayPath?: string;
}

/**
 * D1/D2 — build the registry by globbing agent frontmatter ⊕ overlay. The result is the
 * cache content; `source` points back to each agent .md (the SOT).
 */
export function buildRegistry(opts: BuildOptions): ExecutorRegistry {
  const overlay: Overlay = opts.overlayPath && existsSync(opts.overlayPath)
    ? JSON.parse(readFileSync(opts.overlayPath, 'utf-8'))
    : {};

  const entries: Executor[] = [];
  for (const file of readdirSync(opts.agentsDir).filter((f) => f.endsWith('.md')).sort()) {
    const fm = parseFrontmatter(readFileSync(join(opts.agentsDir, file), 'utf-8'));
    if (!isExecutorFrontmatter(fm)) continue; // skip CHIEFs / malformed
    const id = fm!.name!;
    const base: Executor = {
      id,
      name: id,
      type: 'agent',
      subagent_type: id,
      source: join(opts.agentsDir, file),
      capabilities: fm!.capabilities!,
      domains: fm!.domains!,
      authority: fm!.authority!,
      wip_limit: fm!.wip_limit!,
      escalation: fm!.escalation!,
      status: 'active',
    };
    entries.push(applyOverlay(base, overlay[id]));
  }

  return {
    $schema: 'aiox-executors-v1',
    type: 'dev-executors',
    total_executors: entries.length,
    entries,
  };
}

/** F9a — generate the registry cache file (creates the dir if needed). Returns the registry. */
export function generateRegistry(opts: BuildOptions & { outPath: string }): ExecutorRegistry {
  const registry = buildRegistry(opts);
  mkdirSync(dirname(opts.outPath), { recursive: true });
  writeFileSync(opts.outPath, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
  return registry;
}

/** D2 — load the generated cache. The frontmatter remains the SOT; a stale cache is rebuilt. */
export function loadRegistry(filePath: string): ExecutorRegistry {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as ExecutorRegistry;
}

// --- CLI: node --experimental-strip-types executor-registry.ts <agentsDir> <outPath> [overlayPath]
if (import.meta.url === `file://${process.argv[1]}` || basename(process.argv[1] ?? '') === 'executor-registry.ts') {
  const [agentsDir, outPath, overlayPath] = process.argv.slice(2);
  if (!agentsDir || !outPath) {
    console.error('usage: executor-registry.ts <agentsDir> <outPath> [overlayPath]');
    process.exit(2);
  }
  const reg = generateRegistry({ agentsDir, outPath, overlayPath });
  console.log(`[executor-registry] wrote ${reg.total_executors} executors → ${outPath}`);
}
