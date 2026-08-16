#!/usr/bin/env node
// context-diet :: audit-context.mjs
// -----------------------------------------------------------------------------
// Measures the ALWAYS-LOADED context footprint of a Claude Code project:
//   CLAUDE.md  +  .claude/rules/*.md (sem `paths:`)  +  memory MEMORY.md index
// e propoe uma disposicao (KEEP-GLOBAL / SCOPE / FIX-KEY / ON-DEMAND / REVIEW)
// por rule. READ-ONLY. Cross-platform (Windows/Linux). Zero dependencias.
//
// Uso:
//   node audit-context.mjs [--project <dir>] [--json] [--out <file>] [--baseline <file>]
//
//   --project <dir>   raiz do projeto (default: cwd)
//   --json            emite o relatorio JSON no stdout (em vez da tabela humana)
//   --out <file>      grava o JSON num arquivo (para virar baseline depois)
//   --baseline <file> compara o estado atual contra um JSON de baseline (diff)
//
// Modelo do mecanismo (nativo do Claude Code, ver references/frontmatter-model.md):
//   - rule COM `paths:` (globs != "**")  -> carrega SO quando um arquivo casa   (CONDICIONAL)
//   - rule SEM frontmatter / sem `paths:` -> carrega SEMPRE                       (CUSTO FIXO)
//   - rule com `globs:` (chave errada)    -> IGNORADO -> carrega SEMPRE           (BUG: FIX-KEY)
//   - rule com `paths: ["**"]`            -> casa tudo -> carrega SEMPRE          (ARMADILHA)
// -----------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(args.project || process.cwd());
const asJson = !!args.json;

// ~4 chars/token — bate com o /context (CLAUDE.md 407 l. -> 13.9k tokens observados).
const estTokens = (chars) => Math.round(chars / 4);

// Rules cross-cutting no repo de referencia (synkra-hub). HINT apenas — o modelo decide.
const KNOWN_GLOBAL_HINTS = new Set([
  'agent-authority', 'complete-findings-resolution', 'portable-paths',
  'registry-governance', 'task-lifecycle',
]);

// Tokens de diretorio no corpo da rule -> glob sugerido para `paths:`.
const DIR_GLOBS = [
  ['supabase/', 'supabase/**'],
  ['docs/stories/', 'docs/stories/**'],
  ['docs/architecture/', 'docs/architecture/**'],
  ['.claude/skills/', '.claude/skills/**'],
  ['.claude/agents/', '.claude/agents/**'],
  ['.aiox-core/', '.aiox-core/**'],
  ['.github/workflows/', '.github/workflows/**'],
  ['squads/', 'squads/**'],
  ['services/', 'services/**'],
  ['packages/', 'packages/**'],
  ['infrastructure/', 'infrastructure/**'],
  ['workspace/', 'workspace/**'],
  ['outputs/', 'outputs/**'],
  ['apps/', 'apps/**'],
];

// Sinais fortes de que a rule vale para TODO trabalho -> manter global.
const GLOBAL_SIGNALS = [
  /applies?\s+when\s+any\s+agent/i,
  /before\s+every\s+push/i,
  /any\s+(review|audit|analysis)/i,
  /all\s+(code|findings|agents|development)/i,
  /non-?negotiable/i,
  /never\s+commit/i,
];

main();

function main() {
  if (!fs.existsSync(projectRoot)) {
    console.error(`[context-diet] projeto nao encontrado: ${projectRoot}`);
    process.exit(2);
  }

  const report = buildReport();

  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), JSON.stringify(report, null, 2));
  }

  if (args.baseline && fs.existsSync(args.baseline)) {
    const base = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
    printDiff(base, report);
    return;
  }

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    printHuman(report);
  }
}

function buildReport() {
  const claudeMds = [];
  for (const rel of ['CLAUDE.md', path.join('.claude', 'CLAUDE.md')]) {
    const p = path.join(projectRoot, rel);
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf8');
      claudeMds.push({ file: rel, lines: countLines(t), tokens: estTokens(t.length) });
    }
  }

  const rulesDir = path.join(projectRoot, '.claude', 'rules');
  const rules = [];
  if (fs.existsSync(rulesDir)) {
    for (const name of fs.readdirSync(rulesDir)) {
      if (!name.endsWith('.md')) continue;
      const full = path.join(rulesDir, name);
      if (!fs.statSync(full).isFile()) continue; // pula subdirs (backup-pre-split/)
      rules.push(classify(full));
    }
  }

  const always = rules.filter(r => r.status === 'ALWAYS');
  const scoped = rules.filter(r => r.status === 'SCOPED');
  always.sort((a, b) => b.tokens - a.tokens);

  // Duplicatas entre .claude/rules/ e docs/reference/rules/ (candidatas a DEDUP).
  const refDir = path.join(projectRoot, 'docs', 'reference', 'rules');
  const duplicates = [];
  if (fs.existsSync(refDir)) {
    const refNames = new Set(fs.readdirSync(refDir).filter(n => n.endsWith('.md')));
    for (const r of rules) if (refNames.has(r.file + '.md')) duplicates.push(r.file);
  }

  const memory = measureMemory();

  const claudeTokens = claudeMds.reduce((s, c) => s + c.tokens, 0);
  const alwaysTokens = always.reduce((s, r) => s + r.tokens, 0);
  const fixedTokens = claudeTokens + alwaysTokens + memory.indexTokens;
  // "scopavel" = rules ALWAYS cuja disposicao remove do custo fixo.
  const scopable = always.filter(r => ['SCOPE', 'FIX-KEY', 'ON-DEMAND'].includes(r.disposition));
  const scopableTokens = scopable.reduce((s, r) => s + r.tokens, 0);
  const potentialFixedAfter = fixedTokens - scopableTokens;
  const reductionPct = fixedTokens ? Math.round((scopableTokens / fixedTokens) * 100) : 0;

  return {
    generatedFor: projectRoot,
    claudeMd: claudeMds,
    rules: {
      total: rules.length,
      alwaysCount: always.length,
      scopedCount: scoped.length,
      always,
      scoped: scoped.map(r => ({ file: r.file, tokens: r.tokens, paths: r.paths })),
    },
    memory,
    duplicates,
    totals: {
      claudeTokens, alwaysTokens, memoryIndexTokens: memory.indexTokens,
      fixedTokens, scopableTokens, potentialFixedAfter, reductionPct,
    },
  };
}

function classify(rulePath) {
  const text = fs.readFileSync(rulePath, 'utf8');
  const { has, fm, body } = readFrontmatter(text);
  const base = path.basename(rulePath, '.md');
  const paths = has ? extractGlobs(fm, 'paths') : null;
  const globs = has ? extractGlobs(fm, 'globs') : null;

  const isTrap = paths && paths.length &&
    paths.every(g => g === '**' || g === '**/*' || g === '**/**');

  let status, note = '', disposition = null, suggestedPaths = [];

  if (paths && paths.length && !isTrap) {
    status = 'SCOPED';
  } else if (isTrap) {
    status = 'ALWAYS'; note = 'armadilha: paths ["**"] casa tudo';
  } else if (globs && globs.length) {
    status = 'ALWAYS'; note = 'CHAVE ERRADA globs: (ignorado) -> use paths:';
  } else {
    status = 'ALWAYS'; note = 'sem frontmatter paths:';
  }

  if (status === 'ALWAYS') {
    // Conta mencoes por diretorio p/ ranquear os globs sugeridos (o mais citado 1o).
    const hits = [];
    for (const [tok, glob] of DIR_GLOBS) {
      const n = countOccurrences(body, tok);
      if (n > 0) hits.push({ glob, n });
    }
    hits.sort((a, b) => b.n - a.n);
    const dirs = hits.map(h => h.glob);
    const softGlobal = GLOBAL_SIGNALS.some(r => r.test(body));

    if (globs && globs.length) {
      disposition = 'FIX-KEY'; suggestedPaths = globs;           // reusa os globs (chave errada)
    } else if (KNOWN_GLOBAL_HINTS.has(base)) {
      disposition = 'KEEP-GLOBAL';                                // cross-cutting explicito -> fica
    } else if (dirs.length) {
      disposition = 'SCOPE'; suggestedPaths = dirs.slice(0, 4);   // dominio detectado -> escopar
      if (softGlobal) note += ' (verificar: tem sinal global fraco)';
    } else if (softGlobal) {
      disposition = 'KEEP-GLOBAL';                                // governanca universal sem dominio
    } else {
      disposition = 'ON-DEMAND'; note += ' (sem dominio -> mover p/ docs/reference/rules)';
    }
  }

  return {
    file: base,
    rel: path.relative(projectRoot, rulePath).replace(/\\/g, '/'),
    lines: countLines(text),
    tokens: estTokens(text.length),
    status, note, disposition, suggestedPaths,
    paths: paths || [],
  };
}

function measureMemory() {
  // Claude Code mangla a raiz do projeto: C:\a\b -> C--a-b
  const mangled = projectRoot.replace(/[:\\/]/g, '-');
  const dir = path.join(os.homedir(), '.claude', 'projects', mangled, 'memory');
  const indexPath = path.join(dir, 'MEMORY.md');
  if (!fs.existsSync(indexPath)) return { path: dir, exists: false, indexTokens: 0, entryCount: 0 };
  const idx = fs.readFileSync(indexPath, 'utf8');
  let entryCount = 0;
  try {
    entryCount = fs.readdirSync(dir).filter(n => n.endsWith('.md') && n !== 'MEMORY.md').length;
  } catch { /* ignore */ }
  return { path: dir, exists: true, indexTokens: estTokens(idx.length), indexLines: countLines(idx), entryCount };
}

// ---------- helpers ----------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { out[key] = next; i++; } else out[key] = true;
  }
  return out;
}

function countLines(t) { return t.split(/\r?\n/).length; }

function countOccurrences(haystack, needle) {
  let n = 0, i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

function readFrontmatter(text) {
  const norm = text.replace(/^﻿/, '');
  if (!norm.startsWith('---')) return { has: false, fm: '', body: norm };
  const close = norm.indexOf('\n---', 3);
  if (close === -1) return { has: false, fm: '', body: norm };
  const fm = norm.slice(3, close).replace(/^\r?\n/, '');
  const body = norm.slice(close + 4);
  return { has: true, fm, body };
}

// Extrai globs de uma chave (`paths` ou `globs`). Suporta inline ["a","b"], CSV e block list.
// Retorna null se a chave nao existe; [] se existe mas vazia.
function extractGlobs(fm, key) {
  const lines = fm.split(/\r?\n/);
  const re = new RegExp('^' + key + '\\s*:');
  const idx = lines.findIndex(l => re.test(l));
  if (idx === -1) return null;
  const globs = [];
  const inline = lines[idx].replace(new RegExp('^' + key + '\\s*:\\s*'), '').trim();
  if (inline) {
    for (const part of inline.replace(/[[\]]/g, '').split(',')) {
      const g = part.trim().replace(/^['"]|['"]$/g, '');
      if (g) globs.push(g);
    }
  }
  for (let i = idx + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*-\s*(.+)$/);
    if (!m) { if (/^\S/.test(lines[i])) break; else continue; }
    const g = m[1].trim().replace(/^['"]|['"]$/g, '');
    if (g) globs.push(g);
  }
  return globs;
}

function printHuman(r) {
  const t = r.totals;
  const L = (s = '') => console.log(s);
  L('');
  L(`  context-diet :: auditoria de footprint SEMPRE-CARREGADO`);
  L(`  projeto: ${r.generatedFor}`);
  L('  ' + '-'.repeat(72));
  for (const c of r.claudeMd) L(`  CLAUDE.md  ${c.file.padEnd(22)} ${String(c.lines).padStart(5)} l  ~${c.tokens} tok`);
  if (r.memory.exists) L(`  MEMORY.md  (index)${''.padEnd(15)} ${String(r.memory.indexLines).padStart(5)} l  ~${r.memory.indexTokens} tok  (${r.memory.entryCount} entradas)`);
  L('  ' + '-'.repeat(72));
  L(`  RULES: ${r.rules.total} total | ${r.rules.alwaysCount} ALWAYS-LOAD (custo fixo) | ${r.rules.scopedCount} escopadas (condicional)`);
  if (r.duplicates.length) L(`  DUPLICATAS .claude/rules <-> docs/reference/rules: ${r.duplicates.join(', ')}`);
  L('');
  L(`  Always-loaded rules (maior -> menor) e disposicao sugerida:`);
  L(`  ${'RULE'.padEnd(34)} ${'TOK'.padStart(6)} ${'DISPOSICAO'.padEnd(12)} NOTA / paths sugeridos`);
  for (const rule of r.rules.always) {
    const sp = rule.suggestedPaths.length ? rule.suggestedPaths.join(',') : rule.note;
    L(`  ${rule.file.padEnd(34)} ${String(rule.tokens).padStart(6)} ${(rule.disposition || '').padEnd(12)} ${sp}`);
  }
  L('');
  L('  ' + '='.repeat(72));
  L(`  CUSTO FIXO ATUAL:  ~${t.fixedTokens} tok`);
  L(`     CLAUDE.md ${t.claudeTokens} + rules-always ${t.alwaysTokens} + MEMORY.md ${t.memoryIndexTokens}`);
  L(`  ESCOPAVEL:         ~${t.scopableTokens} tok  (rules ALWAYS -> SCOPE/FIX-KEY/ON-DEMAND)`);
  L(`  POTENCIAL POS-DIETA: ~${t.potentialFixedAfter} tok   (reducao ~${t.reductionPct}% do custo fixo)`);
  L(`     (rules em REVIEW/KEEP-GLOBAL nao contam — exigem julgamento humano)`);
  L('  ' + '='.repeat(72));
  L('');
}

function printDiff(base, cur) {
  const b = base.totals, c = cur.totals;
  const d = (x, y) => (y - x >= 0 ? '+' : '') + (y - x);
  console.log('');
  console.log('  context-diet :: DIFF (baseline -> atual)');
  console.log('  ' + '-'.repeat(60));
  console.log(`  rules ALWAYS : ${base.rules.alwaysCount} -> ${cur.rules.alwaysCount}  (${d(base.rules.alwaysCount, cur.rules.alwaysCount)})`);
  console.log(`  rules SCOPED : ${base.rules.scopedCount} -> ${cur.rules.scopedCount}  (${d(base.rules.scopedCount, cur.rules.scopedCount)})`);
  console.log(`  custo fixo   : ~${b.fixedTokens} -> ~${c.fixedTokens} tok  (${d(b.fixedTokens, c.fixedTokens)})`);
  const pct = b.fixedTokens ? Math.round(((b.fixedTokens - c.fixedTokens) / b.fixedTokens) * 100) : 0;
  console.log(`  reducao real : ~${pct}% do custo fixo`);
  console.log('  ' + '-'.repeat(60));
  console.log('');
}
