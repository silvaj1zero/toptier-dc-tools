#!/usr/bin/env node
// context-diet :: apply-scope.mjs
// -----------------------------------------------------------------------------
// Aplica as mudancas de dieta de contexto de forma CONFIAVEL (via node fs, nao
// Edit/Write built-in — que no Windows/MSYS reportam sucesso sem persistir).
// Faz backup, escreve, RE-LE do disco e verifica antes de declarar sucesso.
//
// Acoes:
//   set-paths   Adiciona/substitui o bloco `paths:` no frontmatter de uma rule.
//   fix-key     Converte `globs:` (chave ignorada) em `paths:` reusando os globs.
//   on-demand   Move a rule para docs/reference/rules/ e imprime a linha da
//               tabela "Read when" para colar no CLAUDE.md.
//   plan        Aplica um lote a partir de um JSON [{file, action, paths?}].
//
// Uso:
//   node apply-scope.mjs set-paths  --project <dir> --rule <nome|rel> --paths "a/**,b/**"
//   node apply-scope.mjs fix-key    --project <dir> --rule <nome>
//   node apply-scope.mjs on-demand  --project <dir> --rule <nome>
//   node apply-scope.mjs plan       --project <dir> --plan <plan.json> [--force]
//
// Guard: recusa escopar/mover rules cross-cutting (lista GUARD) sem --force.
// -----------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';

const [, , action, ...rest] = process.argv;
const args = parseArgs(rest);
const projectRoot = path.resolve(args.project || process.cwd());
const rulesDir = path.join(projectRoot, '.claude', 'rules');
const backupDir = path.join(projectRoot, '.context-diet-backup');
const force = !!args.force;

// Cross-cutting: nunca escopar/mover sem --force. Ajuste por projeto se preciso.
const GUARD = new Set([
  'agent-authority', 'complete-findings-resolution', 'portable-paths',
  'registry-governance', 'task-lifecycle',
]);

const VALID = new Set(['set-paths', 'fix-key', 'on-demand', 'plan']);
if (!VALID.has(action)) {
  console.error(`[context-diet] acao invalida: ${action || '(nenhuma)'}. Use: ${[...VALID].join(' | ')}`);
  process.exit(2);
}

let results = [];
try {
  if (action === 'plan') runPlan();
  else results.push(runOne(action, args.rule, args.paths));
} catch (e) {
  console.error(`[context-diet] ERRO: ${e.message}`);
  process.exit(1);
}

const failed = results.filter(r => !r.ok);
printResults(results);
process.exit(failed.length ? 1 : 0);

// ---------- acoes ----------

function runPlan() {
  if (!args.plan) throw new Error('plan requer --plan <plan.json>');
  const plan = JSON.parse(fs.readFileSync(path.resolve(args.plan), 'utf8'));
  const items = Array.isArray(plan) ? plan : (plan.items || []);
  for (const it of items) {
    const act = it.action === 'FIX-KEY' ? 'fix-key'
      : it.action === 'ON-DEMAND' ? 'on-demand'
      : it.action === 'SCOPE' ? 'set-paths' : it.action;
    if (!['set-paths', 'fix-key', 'on-demand'].includes(act)) {
      results.push({ file: it.file, ok: false, msg: `acao de plano nao aplicavel: ${it.action}` });
      continue;
    }
    const paths = Array.isArray(it.paths) ? it.paths.join(',') : it.paths;
    try { results.push(runOne(act, it.file, paths)); }
    catch (e) { results.push({ file: it.file, ok: false, msg: e.message }); }
  }
}

function runOne(act, ruleArg, pathsArg) {
  if (!ruleArg) throw new Error(`${act} requer --rule <nome>`);
  const rulePath = resolveRule(ruleArg);
  const base = path.basename(rulePath, '.md');

  if (GUARD.has(base) && !force) {
    return { file: base, ok: false, msg: 'GUARD: rule cross-cutting (use --force para forcar)' };
  }

  if (act === 'on-demand') return moveOnDemand(rulePath, base);

  const text = fs.readFileSync(rulePath, 'utf8');
  let globs;
  if (act === 'fix-key') {
    const { fm } = readFrontmatter(text);
    globs = extractGlobs(fm, 'globs');
    if (!globs || !globs.length) return { file: base, ok: false, msg: 'sem globs: para converter' };
  } else { // set-paths
    if (!pathsArg) throw new Error(`set-paths requer --paths "a/**,b/**" (rule ${base})`);
    globs = pathsArg.split(',').map(s => s.trim()).filter(Boolean);
  }

  const next = setPaths(text, globs);
  backup(rulePath, text);
  fs.writeFileSync(rulePath, next);

  // verify-on-disk (o log da sessao NAO e fonte de verdade — o disco e)
  const check = extractGlobs(readFrontmatter(fs.readFileSync(rulePath, 'utf8')).fm, 'paths') || [];
  const ok = globs.every(g => check.includes(g));
  return { file: base, ok, msg: ok ? `paths: [${globs.join(', ')}]` : 'FALHA na verificacao em disco' };
}

function moveOnDemand(rulePath, base) {
  const destDir = path.join(projectRoot, 'docs', 'reference', 'rules');
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, base + '.md');
  const text = fs.readFileSync(rulePath, 'utf8');
  backup(rulePath, text);
  fs.writeFileSync(dest, text);
  fs.unlinkSync(rulePath);
  const ok = fs.existsSync(dest) && !fs.existsSync(rulePath);
  return {
    file: base, ok,
    msg: ok
      ? `movida -> docs/reference/rules/${base}.md | tabela CLAUDE.md: | \`${base}.md\` | Working in <dominio> |`
      : 'FALHA no move',
  };
}

// ---------- frontmatter ----------

function setPaths(text, globs) {
  const { has, fm, body } = readFrontmatter(text);
  const block = 'paths:\n' + globs.map(g => `  - "${g}"`).join('\n');
  if (!has) {
    return `---\n${block}\n---\n\n${text.replace(/^\s+/, '')}`;
  }
  let lines = fm.split(/\r?\n/);
  lines = stripKey(lines, 'paths');
  lines = stripKey(lines, 'globs');
  const rest = lines.join('\n').replace(/\n{2,}/g, '\n').trim();
  const newFm = block + (rest ? '\n' + rest : '');
  return `---\n${newFm}\n---${body.startsWith('\n') ? '' : '\n'}${body}`;
}

function stripKey(lines, key) {
  const re = new RegExp('^' + key + '\\s*:');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      // pula a chave + suas linhas de block-list continuadas ("  - ...")
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) i++;
      continue;
    }
    out.push(lines[i]);
  }
  return out;
}

function readFrontmatter(text) {
  const norm = text.replace(/^﻿/, '');
  if (!norm.startsWith('---')) return { has: false, fm: '', body: norm };
  const close = norm.indexOf('\n---', 3);
  if (close === -1) return { has: false, fm: '', body: norm };
  return { has: true, fm: norm.slice(3, close).replace(/^\r?\n/, ''), body: norm.slice(close + 4) };
}

function extractGlobs(fm, key) {
  const lines = fm.split(/\r?\n/);
  const re = new RegExp('^' + key + '\\s*:');
  const idx = lines.findIndex(l => re.test(l));
  if (idx === -1) return null;
  const globs = [];
  const inline = lines[idx].replace(new RegExp('^' + key + '\\s*:\\s*'), '').trim();
  if (inline) for (const p of inline.replace(/[[\]]/g, '').split(',')) {
    const g = p.trim().replace(/^['"]|['"]$/g, ''); if (g) globs.push(g);
  }
  for (let i = idx + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*-\s*(.+)$/);
    if (!m) { if (/^\S/.test(lines[i])) break; else continue; }
    const g = m[1].trim().replace(/^['"]|['"]$/g, ''); if (g) globs.push(g);
  }
  return globs;
}

// ---------- helpers ----------

function resolveRule(ruleArg) {
  const candidates = [
    path.resolve(projectRoot, ruleArg),
    path.join(rulesDir, ruleArg),
    path.join(rulesDir, ruleArg.endsWith('.md') ? ruleArg : ruleArg + '.md'),
  ];
  for (const c of candidates) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  throw new Error(`rule nao encontrada: ${ruleArg}`);
}

function backup(rulePath, text) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(backupDir, path.basename(rulePath)), text);
}

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

function printResults(results) {
  console.log('');
  for (const r of results) console.log(`  [${r.ok ? 'OK ' : 'XX '}] ${r.file.padEnd(34)} ${r.msg}`);
  const ok = results.filter(r => r.ok).length;
  console.log(`\n  ${ok}/${results.length} aplicadas. Backups em: ${path.relative(projectRoot, backupDir) || '.context-diet-backup'}/`);
  console.log('');
}
