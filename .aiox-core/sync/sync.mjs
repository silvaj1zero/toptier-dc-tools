#!/usr/bin/env node
// AIOX framework sync — projects the CLI-agnostic SOT into per-CLI surfaces, OVERLAY-aware.
//
//   node .aiox-core/sync/sync.mjs [adapter ...]              # PROJECT target: repo-local CLI projections
//   node .aiox-core/sync/sync.mjs claude|codex               # just one adapter
//   node .aiox-core/sync/sync.mjs --global [adapter ...]     # GLOBAL target: CLI home dirs (operator layer, D7)
//   node .aiox-core/sync/sync.mjs --global --dest-root=/tmp/x claude   # GLOBAL semantics, explicit dest (tests)
//   node .aiox-core/sync/sync.mjs --global --force [...]     # force/repair: overwrite even on local-edit drift (029.W1.2)
//   node .aiox-core/sync/sync.mjs --global --status [...]    # READ-ONLY: per-skill managed/version/drift report (029.W1.2)
//   node .aiox-core/sync/sync.mjs --global --sinkra-os-tier=mapear|forjar [...]  # entitled sinkra-os tier (029.W1.3;
//                                                            # absent = "none" = base tier only — fail-closed)
//   node .aiox-core/sync/sync.mjs --lint-refs                # CHECK: SKILL.md refs to re-homed rules (D5, no writes)
//   node .aiox-core/sync/sync.mjs --check-projections        # CHECK: repo projections equal generated output (D1/D7)
//
// CONSUMER OVERLAY (ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER D3, story 2.12): a consuming project can extend which
//   skills receive an on-demand copy of a re-homed rule via .aiox-project/sync-references.json
//   ({ "<skill>": ["<rule>", …] }) — UNIONED over the base map, never shrinking it. See sync-references.json.example.
//   `--lint-refs` catches the drift (a SKILL.md still citing .claude/rules/<re-homed>.md) before the overlay is adopted.
//
// PLUGIN NAMESPACE (ADR-COCKPIT-ENTERPRISE-PREMIUM-PACK D23/D24(a), story 055.W2.2): inside the overlay's
//   skills/ dir, a nested `<plugin-id>/<skill>/SKILL.md` is PLUGIN content and projects to
//   `<dest>/skills/<plugin-id>/<skill>` — the namespace IS the path, so two plugins shipping the same skill
//   name cannot be the same map key (collision is not representable, not merely detected). A FLAT
//   `<skill>/SKILL.md` is the consuming project's own first-party layer. Either one may replace a BASE
//   skill of the same name ONLY when declared in `.aiox-project/skills-tiers.json` under
//   `{"overlay": {"id": "<plugin-id>", "shadows": {"<skill>": "<reason>"}}}`; undeclared, the base skill is
//   KEPT and the overlay copy is refused, loudly. `overlay.id` is IMMUTABLE (D24(a)) — it is a path root on
//   every client's disk. See resolveItems()/OVERLAY_SHADOWS and .aiox-core/sync/OVERLAY-MANIFEST.md.
//
// Two SOTs, layered (base first, then project on top — PROJECT WINS on a name collision, EXCEPT skills,
//   which since 055.W2.2 require the declaration above):
//   base    = .aiox-core/{rules,agents,skills,templates}   # installed framework (read-only here)
//   project = .aiox-project/{rules,agents,skills,templates} # the consuming project's own layer (OPTIONAL)
// Projections (GENERATED — never hand-edit): .claude/, .codex/, .gemini/, ...
//
// PRODUCER (the cockpit itself): there is NO .aiox-project/, so the overlay is a no-op and the
//   output is exactly the base — identical to the pre-overlay behaviour.
// CLIENT (e.g. sinkra-hub): .aiox-project/ holds the SINKRA-only layer; a core update NEVER deletes
//   it (it lives in a separate SOT) and the project layer overrides a same-named base item.
//
// TWO TARGETS (ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER):
//   PROJECT (default) — dest = <repo>/.claude/. Blanket-cleans each mapped dir (the projection is
//     fully generated), then projects base ⊕ project. Rules ARE projected (repo contract).
//   GLOBAL  (--global) — dest = ~/.claude/ (the operator's machine layer, D1/D7). The dest also holds
//     the USER's own global skills/agents (e.g. context-diet) — so it is NEVER blanket-cleaned.
//     Projection is ADDITIVE + MANIFEST-TRACKED: only AIOX-managed items are written/removed; a stale
//     AIOX item (dropped from the SOT) is pruned via the previous manifest; user items are untouched.
//     Rules are NOT projected globally (D3 — enforcement rules ride on-demand inside the skills; only
//     portable-paths goes always-on, and that + the conductor hooks are the cockpit's install job, #9).
//
// Adding a new CLI = add an entry to ADAPTERS below. Dependency-free (node:fs/node:path/node:os only).

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  cpSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import { createHash } from "node:crypto";

const SOT = resolve(dirname(fileURLToPath(import.meta.url)), ".."); // .aiox-core/  (base)
const ROOT = resolve(SOT, ".."); // repo root
const PROJECT = join(ROOT, ".aiox-project"); // project layer (optional)

// ─── Target selection (D7) ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith("--"));
const wanted = argv.filter((a) => !a.startsWith("--"));
const GLOBAL = flags.includes("--global");
const FORCE = flags.includes("--force"); // 029.W1.2 (AC4): explicit force/repair — overwrite even on local-edit drift
const STATUS = flags.includes("--status"); // 029.W1.2 (AC5): read-only per-skill drift report — never writes
const CHECK_PROJECTIONS = flags.includes("--check-projections"); // 031.W5.2 (D1/D7): read-only project guard
// 029.W1.3 (D1/D3 ADR-COCKPIT-GLOBAL-SKILLS-PROVISIONING) — the sinkra-os tier the COCKPIT resolved via
// gate_plugin("sinkra-os", tier) and forwards here (provision.rs). Absent flag = "none" = NOT entitled
// (fail-closed): a bare `node sync.mjs --global` provisions only the base tier. Vocabulary is EXACT-match
// free-form strings per Epic 024's accepted debt: "mapear" | "forjar" (forjar strictly supersets mapear).
const SINKRA_OS_TIER = (() => {
  const f = flags.find((a) => a.startsWith("--sinkra-os-tier="));
  return f ? f.split("=").slice(1).join("=") : "none";
})();
const destRootFlag = flags.find((f) => f.startsWith("--dest-root="));
const CHECK_ROOT = CHECK_PROJECTIONS ? mkdtempSync(join(tmpdir(), "aiox-projection-check-")) : null;
const DEST_ROOT =
  CHECK_ROOT ?? (destRootFlag ? resolve(destRootFlag.split("=").slice(1).join("=")) : GLOBAL ? homedir() : ROOT);

// Rule re-homing (ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER D3): these rules are NOT always-on. Their canonical
// content stays in .aiox-core/rules/ (SINGLE source — never duplicated by hand), the flat rules projection
// EXCLUDES them, and sync MATERIALIZES a copy into each consuming skill's references/ (both targets). So the
// enforcement contract loads ON-DEMAND when its skill runs, travels with the skill to ~/.claude/, and costs
// zero fixed context. portable-paths remains the sole always-on rule; the domain rules keep their `paths:` scope.
const REFERENCE_ONLY_RULES = ["agent-authority", "pr-merge-strategy", "complete-findings-resolution", "agent-handoff"];
const SKILL_REFERENCES = {
  push: ["agent-authority", "pr-merge-strategy"],
  "wave-execute": ["pr-merge-strategy", "agent-handoff"],
  "apply-qa-fixes": ["complete-findings-resolution"],
  roundtable: ["complete-findings-resolution"],
  "ds-quality-gate": ["complete-findings-resolution"],
};

// Consumer escape hatch (ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER D3, story 2.12). A consuming project whose OWN
// skills (e.g. sinkra-full-cycle, sinkra-push) cite a re-homed rule needs that rule materialized into its
// skills too — without forking the base map. The OPTIONAL overlay `.aiox-project/sync-references.json`
//   { "<skill-name>": ["<rule-name>", …] }
// is UNIONED over SKILL_REFERENCES: it can add new skills or extend a base skill's list, but never shrinks
// the base contract (D3 default preserved). Absent file = base behaviour, byte-identical. Malformed JSON /
// wrong shape = warn + ignore (best-effort, never aborts the sync). Keys starting with `_` are treated as
// doc comments and skipped (lets the .example carry a `_doc`). See sync-references.json.example.
const SYNC_REFERENCES_OVERLAY = join(PROJECT, "sync-references.json");

// A skill folder name / rule name is a bare kebab token — NEVER a path. Validating BOTH the overlay keys
// (skills) and values (rules) keeps a consumer-supplied overlay from escaping the skills/ or references/ dir
// (`../…`) when materializeReferences does join(destSkills, skill) / join(SOT/rules, rule+".md").
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/;

function resolveSkillReferences() {
  // null-proto map: an overlay key like "constructor"/"__proto__" must not resolve to an inherited property
  // (which would make `...(merged[skill] || [])` spread a function and throw — breaking the never-abort rule).
  const merged = Object.create(null);
  for (const [skill, rules] of Object.entries(SKILL_REFERENCES)) merged[skill] = [...rules]; // clone — never mutate base
  if (!existsSync(SYNC_REFERENCES_OVERLAY)) return merged;
  let overlay;
  try {
    overlay = JSON.parse(readFileSync(SYNC_REFERENCES_OVERLAY, "utf8"));
  } catch (e) {
    console.warn(`[sync] WARN: .aiox-project/sync-references.json is malformed JSON — ignoring overlay (${e.message})`);
    return merged;
  }
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) {
    console.warn(`[sync] WARN: .aiox-project/sync-references.json must be an object { "<skill>": ["<rule>", …] } — ignoring overlay`);
    return merged;
  }
  for (const [skill, rules] of Object.entries(overlay)) {
    if (skill.startsWith("_")) continue; // doc comment (e.g. "_doc")
    if (!SAFE_NAME.test(skill)) {
      console.warn(`[sync] WARN: sync-references overlay key "${skill}" is not a bare skill name — skipping`);
      continue;
    }
    if (!Array.isArray(rules) || !rules.every((r) => typeof r === "string")) {
      console.warn(`[sync] WARN: sync-references overlay entry "${skill}" must be an array of rule names — skipping`);
      continue;
    }
    const safe = rules.filter((r) => {
      if (SAFE_NAME.test(r)) return true;
      console.warn(`[sync] WARN: sync-references overlay "${skill}" → "${r}" is not a bare rule name — skipping it`);
      return false;
    });
    merged[skill] = [...new Set([...(merged[skill] || []), ...safe])]; // union + dedupe; project extends base
  }
  return merged;
}

// Resolved once at load (single overlay read → single warn, shared by materialize + lint).
const SKILL_REFS = resolveSkillReferences();

// Each adapter maps SOT sub-dirs -> a destination layout for one CLI.
// `kind: "tree"` mirrors a directory of sub-dirs (skills); `kind: "flat"` mirrors *.md files.
// `global: false` on a mapping = PROJECT-only (skipped in the global target — e.g. rules, D3).
// `exclude: [...]` drops named items (no .md) from a flat mapping (the reference-only rules, D3).
const ADAPTERS = {
  claude: {
    dest: ".claude",
    map: [
      { from: "rules", to: "rules", kind: "flat", global: false, exclude: REFERENCE_ONLY_RULES },
      { from: "agents", to: "agents", kind: "flat" },
      { from: "skills", to: "skills", kind: "tree" },
    ],
  },
  codex: {
    dest: ".codex",
    map: [
      { from: "agents", to: "agents", kind: "flat", rename: "codex-agent", transform: "codex-agent" },
      { from: "skills", to: "skills", kind: "tree", rename: "lowercase", transform: "codex-skill" },
    ],
  },
  // gemini: { dest: ".gemini", map: [...] },   // future — GEMINI.md format
};

const MANIFEST = ".aiox-sync-manifest.json"; // written into the global dest (never in project mode)

function mdFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")).sort() : [];
}
function subDirs(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory()).sort() : [];
}

// True when .aiox-project/ is a real directory holding an actual overlay layer — i.e. anything beyond the
// lone committed sync-references.json.example template. Defensive: a non-dir / unreadable path → false (no
// project), never a crash (preserves the pre-2.12 tolerance of an absent project dir).
function projectHasLayer() {
  try {
    return statSync(PROJECT).isDirectory() && readdirSync(PROJECT).some((n) => n !== "sync-references.json.example");
  } catch {
    return false;
  }
}

// ─── Story 055.W2.2 (D23 ADR-COCKPIT-ENTERPRISE-PREMIUM-PACK) — namespace obrigatório por plugin ────
// The overlay dir `.aiox-project/skills/` is TWO different things wearing one directory, and until this
// story the sync could not tell them apart:
//   · FIRST-PARTY layer — the consuming project's OWN skills, flat:   .aiox-project/skills/<skill>
//   · PLUGIN content    — an installed pack's skills, NESTED:         .aiox-project/skills/<plugin-id>/<skill>
// The discriminator is the DISK, never a manifest field: a dir that holds a SKILL.md IS a skill; a dir
// that holds skill dirs instead is a plugin root. That is why AC2 ("colisão impossível por construção,
// não por checagem") holds — the namespace IS the path. Two plugins shipping `review` resolve to
// `a/review` and `b/review`; they are not the same Map key, so there is no collision to detect, count or
// report. D23 verbatim: `<plugin-id>/<skill>`, nunca por pessoa.
//
// Returns [{ name, src, plugin }] — `name` is the PROJECTED item name (namespaced for plugin content),
// `plugin` is the plugin id or null for the first-party layer. Pure — no writes; tolerant like the rest
// of this file (a malformed entry warns and is skipped, never aborts the sync).
function overlaySkillEntries() {
  const root = join(PROJECT, "skills");
  const entries = [];
  for (const e of subDirs(root)) {
    const dir = join(root, e);
    if (existsSync(join(dir, "SKILL.md"))) {
      entries.push({ name: e, src: dir, plugin: null }); // first-party overlay skill (flat)
      continue;
    }
    // A plugin id is a namespace ROOT on the user's disk (D24(a)) — it must be a bare kebab token so it
    // can never escape skills/ via join(dst, name).
    if (!SAFE_NAME.test(e)) {
      console.warn(`[sync] WARN: .aiox-project/skills/${e} is neither a skill (no SKILL.md) nor a valid plugin id — skipping`);
      continue;
    }
    const children = subDirs(dir);
    const nested = children.filter((s) => SAFE_NAME.test(s) && existsSync(join(dir, s, "SKILL.md")));
    // Self-heal (QG engine `coderabbit`): a rejected child must SPEAK. If at least one sibling is a valid
    // skill the `!nested.length` warn below never fires, so a child dropped for a bad name or a missing
    // SKILL.md would vanish from the projection in silence — the exact defect class this story exists to
    // remove, reintroduced on the brand-new plugin surface where the author has no other signal.
    for (const s of children) {
      if (nested.includes(s)) continue;
      const why = SAFE_NAME.test(s) ? "no SKILL.md" : "name is not a bare kebab token";
      console.warn(`[sync] WARN: .aiox-project/skills/${e}/${s} is not a projectable plugin skill (${why}) — skipping it`);
    }
    if (!nested.length) {
      console.warn(`[sync] WARN: .aiox-project/skills/${e} has no SKILL.md and holds no plugin skills — skipping`);
      continue;
    }
    for (const s of nested) entries.push({ name: `${e}/${s}`, src: join(dir, s), plugin: e });
  }
  return entries;
}

// Resolve the layered item list for one mapped dir: base items first, project on top.
// Returns { items: [[name, srcPath], ...], baseItems, projCount, collisions, shadowed, refused, withheld }.
// Pure — no writes.
// verbatimSymlinks note: kept AS-IS on copy so a RELATIVE symlink target is not resolved to an ABSOLUTE
// machine path in a committed projection (issue #23; portable-paths.md).
//
// 055.W2.2 (D23): the `skills` tree mapping no longer does "project wins wholly". Skills are the surface
// D23 protects (`close`/`push`/`review` are skills), so the namespace + declaration gate lives HERE — the
// ONE point where the name map forms — following 055.W1.1's ratified principle: a SECOND SOURCE feeding
// the SAME decision point, never a second gate. Every other mapping (agents, rules) keeps the pre-D23
// layered behaviour verbatim; D23 does not reach them and widening it here would be story-invented scope.
function resolveItems(from, kind) {
  const list = kind === "flat" ? mdFiles : subDirs;
  const baseItems = list(join(SOT, from));
  const map = new Map();
  for (const it of baseItems) map.set(it, join(SOT, from, it));

  if (!(kind === "tree" && from === "skills")) {
    const projItems = list(join(PROJECT, from)); // [] when .aiox-project/ absent
    let collisions = 0;
    for (const it of projItems) {
      if (map.has(it)) collisions++;
      map.set(it, join(PROJECT, from, it)); // project wins wholly (agents/rules — unchanged)
    }
    return { items: [...map.entries()], baseItems, projCount: projItems.length, collisions, shadowed: [], refused: [], withheld: [] };
  }

  // A plugin id that equals an EXISTING item name would make `<dest>/skills/<id>` be both a skill dir and
  // a namespace root — cpSync would nest the plugin's skills INSIDE that skill, and the GLOBAL per-item
  // rmSync would then delete them, order-dependently. Refuse the plugin instead of corrupting the disk.
  // (`overlay.id` immutability, D24(a), makes this a publish-time invariant — 055.W3.3 verifies it in the
  // catalog CI. Here it is the runtime backstop, because the sync must never be the thing that corrupts.)
  // (Only BASE names can collide with a plugin id. A first-party overlay skill cannot: it IS the same
  // directory entry, and a dir holding SKILL.md is classified as a skill, never descended into.)
  const entries = overlaySkillEntries().filter(({ plugin }) => {
    if (!plugin || !map.has(plugin)) return true;
    console.warn(
      `[sync] WARN: plugin id "${plugin}" collides with an existing ${from} item of the same name — the whole plugin is SKIPPED (a namespace root cannot also be a skill). The plugin must be published under a different, immutable id (D24(a)).`,
    );
    return false;
  });
  const shadowed = []; // declared in the overlay manifest → allowed to replace the base skill
  const refused = []; // undeclared collision → base kept, overlay copy NOT materialized (AC3)
  const withheld = []; // base skill pulled from the projection by a DECLARED plugin shadow (AC1+AC3)

  for (const { name, src, plugin } of entries) {
    // A namespaced plugin item can never equal a base key (base names carry no "/"), so this branch is
    // reachable ONLY for the flat first-party layer. That is the construction proof of AC2.
    if (!map.has(name)) {
      map.set(name, src);
      continue;
    }
    const reason = shadowDeclaration(name);
    if (!reason) {
      refused.push(name); // AC3 negative path: "sem a declaração, o sombreamento NÃO acontece"
      continue;
    }
    map.set(name, src);
    shadowed.push({ name, reason, plugin });
  }

  // AC1 + AC3, the Enterprise case ("o /review da minha empresa"): a PLUGIN skill stays under its
  // namespace — never the bare name — so "shadowing" can only mean WITHHOLDING the base skill from the
  // projection. Honoured only when: the manifest's `overlay.id` NAMES THIS PLUGIN (a declaration is
  // attributable or it is not a declaration — plugin B must never withhold a base skill through plugin
  // A's manifest), the plugin actually ships that skill (declaring content you do not ship withholds
  // nothing), and the target is a BASE item (never the first-party layer).
  for (const { name, plugin } of entries) {
    if (!plugin || plugin !== OVERLAY_SHADOWS?.id) continue;
    const bare = name.slice(plugin.length + 1);
    const reason = shadowDeclaration(bare);
    if (!reason || map.get(bare) !== join(SOT, from, bare)) continue;
    map.delete(bare);
    withheld.push({ base: bare, by: name, reason });
  }

  return { items: [...map.entries()], baseItems, projCount: entries.length, collisions: shadowed.length, shadowed, refused, withheld };
}

function readManifest(p) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return { managed: {} };
  }
}

function projectedName(name, mode) {
  if (mode === "lowercase") return name.toLowerCase();
  if (mode === "codex-agent") return name.replace(/\.md$/i, ".toml").toLowerCase();
  return name;
}

function codexDescription(lines, descriptionIndex, { normalizeAngles = true } = {}) {
  const raw = lines[descriptionIndex].replace(/^description:\s*/, "");
  let description;
  if (/^[>|][+-]?$/.test(raw)) {
    const content = [];
    for (let i = descriptionIndex + 1; i < lines.length; i++) {
      if (lines[i] !== "" && !/^\s/.test(lines[i])) break;
      const line = lines[i].trim();
      if (line) content.push(line);
    }
    description = content.join(" ");
  } else if (raw.startsWith('"')) {
    try {
      description = JSON.parse(raw);
    } catch {
      description = raw.slice(1, raw.endsWith('"') ? -1 : undefined);
    }
  } else if (raw.startsWith("'")) {
    description = raw.slice(1, raw.endsWith("'") ? -1 : undefined).replace(/''/g, "'");
  } else {
    description = raw;
  }

  description = normalizeAngles
    ? description.replace(/<([^<>]+)>/g, "($1)").replace(/>/g, "→").replace(/</g, "←").trim()
    : description.trim();
  if (description.length > 1024) {
    let shortened = description.slice(0, 1023);
    const boundary = shortened.lastIndexOf(" ");
    if (boundary > 800) shortened = shortened.slice(0, boundary);
    description = shortened.trimEnd() + "…";
  }
  return description;
}

function normalizeCodexSkill(skillDir, skillName) {
  const skillMd = join(skillDir, "SKILL.md");
  if (!existsSync(skillMd)) throw new Error(`[sync] Codex skill "${skillName}" has no SKILL.md`);

  const text = readFileSync(skillMd, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`[sync] Codex skill "${skillName}" has no YAML frontmatter`);

  const lines = frontmatter[1].split(/\r?\n/);
  const descriptionIndex = lines.findIndex((line) => /^description:\s*/.test(line));
  if (descriptionIndex < 0) throw new Error(`[sync] Codex skill "${skillName}" has no description`);

  const description = codexDescription(lines, descriptionIndex);
  if (!description) throw new Error(`[sync] Codex skill "${skillName}" has an empty description`);

  const body = text.slice(frontmatter[0].length);
  // 055.W2.2 (D23) — a plugin skill's ITEM name is a path (`<plugin-id>/<skill>`), which is a valid
  // directory but not a valid declared skill name. The DECLARED name joins it with `:` so the namespace
  // SURVIVES the projection instead of being flattened back to a colliding bare name — which is the only
  // property this line actually needs. No-op for base/first-party skills.
  //
  // QG fix-cycle-1 (LOW-4) — HONEST SCOPE OF THE CLAIM. `<plugin>:<skill>` is the form the CLAUDE
  // marketplace uses for plugin-scoped invocation (verified first-hand: `~/.claude/plugins/marketplaces/
  // …/plugins/<plugin>/skills/<skill>`). Whether the CODEX CLI accepts a `:` in `name:` is **NOT
  // verified** — no test, no doc citation. [Confiança: MÉDIA] Do not read this as a cross-CLI capability
  // claim; it is a collision-free encoding whose Codex-side acceptance is an open question, carded in
  // `docs/backlog/codex-declared-name-plugin-skill-forma-nao-verificada.md`.
  const declaredName = skillName.split("/").join(":");
  writeFileSync(skillMd, `---\nname: ${declaredName}\ndescription: ${JSON.stringify(description)}\n---\n${body}`);
}

function normalizeCodexAgent(agentFile, projectedFileName) {
  const text = readFileSync(agentFile, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`[sync] Codex agent "${projectedFileName}" has no YAML frontmatter`);

  const lines = frontmatter[1].split(/\r?\n/);
  const nameIndex = lines.findIndex((line) => /^name:\s*/.test(line));
  const descriptionIndex = lines.findIndex((line) => /^description:\s*/.test(line));
  if (nameIndex < 0) throw new Error(`[sync] Codex agent "${projectedFileName}" has no name`);
  if (descriptionIndex < 0) throw new Error(`[sync] Codex agent "${projectedFileName}" has no description`);

  const rawName = lines[nameIndex].replace(/^name:\s*/, "").trim();
  let sourceName;
  if (rawName.startsWith('"')) {
    try {
      sourceName = JSON.parse(rawName);
    } catch {
      sourceName = rawName.slice(1, rawName.endsWith('"') ? -1 : undefined);
    }
  } else if (rawName.startsWith("'")) {
    sourceName = rawName.slice(1, rawName.endsWith("'") ? -1 : undefined).replace(/''/g, "'");
  } else {
    sourceName = rawName;
  }

  const projectedAgentName = projectedFileName.replace(/\.toml$/i, "");
  if (sourceName !== projectedAgentName) {
    throw new Error(
      `[sync] Codex agent filename/name mismatch: "${projectedFileName}" projects frontmatter name "${sourceName}"`,
    );
  }

  // Codex agent TOML is a native projection: preserve the persona body, translate CLI-specific
  // references, and discard Claude-only frontmatter such as tools/model.
  const forCodex = (value) => value.replaceAll(".claude", ".Codex").replaceAll("CLAUDE.md", "AGENTS.md");
  const description = forCodex(codexDescription(lines, descriptionIndex, { normalizeAngles: false }));
  const body = forCodex(text.slice(frontmatter[0].length).replace(/^\r?\n/, "").trimEnd())
    .replaceAll("\\", "\\\\")
    .replaceAll('"""', '\\"""');
  writeFileSync(
    agentFile,
    `name = ${JSON.stringify(projectedAgentName)}\n` +
      `description = ${JSON.stringify(description)}\n` +
      `developer_instructions = """\n${body}"""\n`,
  );
}

function copyProjectedItem(src, dst, transform, itemName) {
  cpSync(src, dst, { recursive: true, verbatimSymlinks: true });
  if (transform === "codex-skill") normalizeCodexSkill(dst, itemName);
  if (transform === "codex-agent") normalizeCodexAgent(dst, itemName);
}

// D3: copy each consuming skill's on-demand rule references from the canonical .aiox-core/rules/ into
// <destSkillsDir>/<skill>/references/. Runs in both targets so the contract travels with the skill.
// Only touches skills actually present in the projection (adapter subset / partial installs are safe).
//
// QG fix-cycle-1 (MEDIUM-1): `shouldTouch` now receives the ITEM NAME as well as the dir. The caller used
// to recover the name with `basename(skillDir)`, which silently converts `<plugin>/<skill>` back to a bare
// `<skill>` — the SAME key-shape mismatch that produced HIGH-1. The entitlement gate must be asked the
// question in exactly one shape, at every call site; `basename` is now gone from the module.
function materializeReferences(destSkillsDir, shouldTouch = () => true) {
  let count = 0;
  for (const [skill, rules] of Object.entries(SKILL_REFS)) {
    const skillDir = join(destSkillsDir, skill);
    if (!existsSync(skillDir)) continue; // skill not projected — nothing to attach to
    if (!shouldTouch(skillDir, skill)) continue; // 029.W1.2 — drifted (user-edited) skill: never-clobber
    const refDir = join(skillDir, "references");
    mkdirSync(refDir, { recursive: true });
    for (const rule of rules) {
      const src = join(SOT, "rules", rule + ".md");
      if (existsSync(src)) {
        cpSync(src, join(refDir, rule + ".md"));
        count++;
      }
    }
  }
  return count;
}

// AC4 (D5) — consumer-side lint (`--lint-refs`). Flags every SKILL.md reference to `.claude/rules/<rule>.md`
// where <rule> is NEITHER projected flat (i.e. it's a re-homed REFERENCE_ONLY rule, dropped from .claude/rules/)
// NOR materialized into THAT skill's references/ (base map ⊕ overlay). That's exactly the drift the overlay
// fixes — a dangling link once the SOT stops projecting the rule flat. Reports a list + non-zero exit; no fix.
function lintRefs() {
  // AC4 scope = references to a RE-HOMED rule specifically. A re-homed rule is (by the D3 exclude) NEVER
  // projected flat, so its ONLY reachability is materialization into that skill's references/. A reference to
  // a still-flat rule (portable-paths, domain rules) or an unrelated placeholder is out of scope → ignored.
  const rehomed = new Set(REFERENCE_ONLY_RULES);
  const re = /\.claude\/rules\/([a-zA-Z0-9][a-zA-Z0-9-]*)\.md/g;
  const orphans = [];
  // 055.W2.2 — the overlay half is enumerated through the SAME resolver the projection uses, so a
  // namespaced plugin skill (`.aiox-project/skills/<plugin-id>/<skill>`) is linted too. Walking
  // `subDirs()` directly would have read `<plugin-id>/SKILL.md`, found nothing, and silently skipped
  // every plugin skill — a lint hole created by the very namespace this story introduces.
  const layers = [
    ...subDirs(join(SOT, "skills")).map((skill) => ({ skill, dir: join(SOT, "skills", skill) })),
    ...overlaySkillEntries().map(({ name, src }) => ({ skill: name, dir: src })),
  ];
  for (const { skill, dir } of layers) {
    const skillMd = join(dir, "SKILL.md");
    if (!existsSync(skillMd)) continue;
    const text = readFileSync(skillMd, "utf8");
    const materialized = new Set(SKILL_REFS[skill] || []);
    const seen = new Set();
    let m;
    while ((m = re.exec(text)) !== null) {
      const rule = m[1];
      if (seen.has(rule)) continue;
      seen.add(rule);
      if (!rehomed.has(rule)) continue; // not a re-homed rule → not a re-homing drift (out of AC4 scope)
      if (materialized.has(rule)) continue; // materialized into this skill → reachable
      orphans.push({ skill, rule, file: relative(ROOT, skillMd) });
    }
  }
  if (orphans.length === 0) {
    console.log("[sync:lint-refs] OK — no orphaned re-homed rule references in any SKILL.md.");
    return 0;
  }
  console.error(`[sync:lint-refs] ${orphans.length} orphaned reference(s) to a re-homed rule (neither flat nor materialized):`);
  for (const o of orphans) {
    console.error(
      `  ✗ ${o.file}: cites .claude/rules/${o.rule}.md — add "${o.skill}": ["${o.rule}"] to ` +
        `.aiox-project/sync-references.json (or drop the reference).`,
    );
  }
  return 1;
}

// ─── 029.W1.2 (D3 ADR-COCKPIT-GLOBAL-SKILLS-PROVISIONING) — per-skill managed sidecar ──────────────
// A per-SKILL content-hash sidecar written INSIDE each GLOBAL-materialized skill dir. NOT the same thing
// as the per-adapter `.aiox-sync-manifest.json` above (that one tracks WHICH item names are AIOX-managed,
// D7; this one records the CONTENT the sync last wrote, so a user edit is detectable). If the on-disk hash
// diverges from the sidecar's, the user edited the skill → the sync SKIPS that item instead of clobbering.
const SIDECAR = ".aiox-managed.json";

// Deterministic content hash of a materialized skill dir: sorted walk, forward-slash relative paths +
// file bytes, NUL-separated; the sidecar itself is excluded (it is written AFTER hashing).
function hashDir(dir) {
  const h = createHash("sha256");
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        walk(p);
      } else {
        const rel = relative(dir, p).split("\\").join("/");
        if (rel === SIDECAR) continue;
        h.update(rel);
        h.update("\0");
        h.update(readFileSync(p));
        h.update("\0");
      }
    }
  };
  walk(dir);
  return h.digest("hex");
}

function readSidecar(itemDir) {
  try {
    return JSON.parse(readFileSync(join(itemDir, SIDECAR), "utf8"));
  } catch {
    return null; // absent / malformed → treated as "no managed hash known" (first install / pre-W1.2)
  }
}

// `version:` from the SOURCE skill's SKILL.md frontmatter (SOT is the version authority — the codex
// transform rewrites the dest frontmatter down to name+description, so the dest is NOT a version source).
function skillVersion(srcDir) {
  try {
    const txt = readFileSync(join(srcDir, "SKILL.md"), "utf8");
    const fm = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const m = fm && fm[1].match(/^version:\s*["']?([^"'\r\n]+)["']?\s*$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

// D3 skip seam — the SINGLE decision point that may hold a managed tree item back from
// (re)materialization/pruning. 029.W1.2 contributes `local-edit` (on-disk hash ≠ last managed hash).
// 029.W1.3 composes the sinkra-os entitlement gate into this SAME seam — never a parallel branch.
function managedSkipReason(dstItem) {
  const sc = readSidecar(dstItem);
  if (!sc || !sc.sha256) return null; // no sidecar → no drift knowledge → write normally (AC1/AC3)
  return hashDir(dstItem) === sc.sha256 ? null : "local-edit";
}

// ─── 029.W1.3 (D1/D3) — sinkra-os entitlement gate ─────────────────────────────────────────────────
// The tier classification the gate consults (029.W1.1's manifest, tags added by 029.W1.3). Absent/
// malformed manifest → warn + untagged behavior; the embedded-bundle test in provision.rs guards the
// build against ever shipping a skills/ dir without an entry, so this branch is a dev-repo safety net.
const SKILLS_TIERS = (() => {
  try {
    return JSON.parse(readFileSync(join(SOT, "skills-tiers.json"), "utf8"));
  } catch {
    if (GLOBAL) console.warn("[sync] WARN: .aiox-core/skills-tiers.json missing/malformed — tier gating inactive this run");
    return null;
  }
})();

// Story 055.W1.1 (AC2) — the OVERLAY's own tier manifest, same shape as SKILLS_TIERS above, read from
// `.aiox-project/skills-tiers.json` when the sinkra-os plugin channel (`plugin_channel.rs`) has
// materialized it. ADDITIVE ONLY — this is a SECOND SOURCE feeding the SAME entitlementSkipReason()
// decision point below, never a second gate: a name already tagged by the BASE manifest is NEVER
// overridden here (resolved with `??`, base wins — see entitlementSkipReason), which is exactly the
// AC1 negative-scope invariant this story is bound by (no re-tag of any of the base's 35 entries).
// Absent/malformed file → null, same tolerant shape as SKILLS_TIERS itself (never aborts the sync).
const PROJECT_SKILLS_TIERS = (() => {
  const p = join(PROJECT, "skills-tiers.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    if (GLOBAL) console.warn(`[sync] WARN: .aiox-project/skills-tiers.json is malformed — overlay tier gating inactive this run (${e.message})`);
    return null;
  }
})();

// ─── Story 055.W2.2 (D23/D24(a)) — the overlay's IDENTITY + its declared shadowing ─────────────────
// VC-6 of the story: the plugin manifest is a CREATE, and it must extend the seam 055.W1.1 already
// opened rather than invent a third file. So it is the SAME file, read by the SAME loader above
// (`PROJECT_SKILLS_TIERS` ← `.aiox-project/skills-tiers.json`), which simply grows one top-level block:
//
//   { "overlay": { "id": "<plugin-id>", "shadows": { "<base-skill>": "<reason>" } },
//     "skills":  { "<name>": { "tier": "…" } } }        ← 029.W1.3 / 055.W1.1, untouched
//
// `overlay.id` — D24(a): IMMUTABLE after the first publication. It is not a catalog label; it is the
//   ROOT OF A NAMESPACE ON EVERY CLIENT'S DISK (`.claude/skills/<id>/<skill>`). Renaming it does not
//   rename an entry — it invalidates every path already projected on every installed machine, and turns
//   the old paths into stale items on the prune path. `055.W3.3` verifies this mechanically in the
//   catalog CI; here it is the written contract (AC7).
// `overlay.shadows` — the ONLY way an overlay item may replace/withhold a base skill (AC3). Absent,
//   malformed, or missing a valid `overlay.id` ⇒ NO shadowing at all: the base skill wins and the
//   overlay copy is refused, loudly. Fail-CLOSED, same posture as `entitlementSkipReason`'s unknown tag.
const OVERLAY_SHADOWS = (() => {
  const ov = PROJECT_SKILLS_TIERS?.overlay;
  if (ov === undefined || ov === null) return null;
  if (typeof ov !== "object" || Array.isArray(ov)) {
    console.warn('[sync] WARN: .aiox-project/skills-tiers.json "overlay" must be an object — ignoring it (no shadowing)');
    return null;
  }
  const shadows = ov.shadows;
  if (shadows === undefined || shadows === null) return null; // identity declared, nothing shadowed — fine
  if (typeof shadows !== "object" || Array.isArray(shadows)) {
    console.warn('[sync] WARN: .aiox-project/skills-tiers.json "overlay".shadows must be an object { "<skill>": "<reason>" } — ignoring it');
    return null;
  }
  if (typeof ov.id !== "string" || !SAFE_NAME.test(ov.id)) {
    console.warn('[sync] WARN: .aiox-project/skills-tiers.json declares "overlay".shadows without a valid "overlay".id — refusing every shadow (D23: shadowing is attributable or it does not happen)');
    return null;
  }
  const out = Object.create(null); // null-proto: a key like "constructor" must not resolve to an inherited prop
  for (const [skill, reason] of Object.entries(shadows)) {
    if (skill.startsWith("_")) continue; // doc comment
    if (!SAFE_NAME.test(skill)) {
      console.warn(`[sync] WARN: "overlay".shadows key "${skill}" is not a bare skill name — skipping it`);
      continue;
    }
    if (typeof reason !== "string" || !reason.trim()) {
      console.warn(`[sync] WARN: "overlay".shadows["${skill}"] must be a non-empty reason string — skipping it (a shadow without a stated reason is exactly the silent override D23 outlaws)`);
      continue;
    }
    out[skill] = reason.trim();
  }
  return { id: ov.id, shadows: out };
})();

// The single lookup `resolveItems` consults. Returns the DECLARED REASON (truthy) or null.
function shadowDeclaration(name) {
  return OVERLAY_SHADOWS?.shadows[name] ?? null;
}

// The entitlement half of the skip seam (029.W1.3): a `pack:sinkra-os*`-tagged skill only materializes
// when the resolved tier satisfies its tag. Plain `pack:sinkra-os` and `:mapear` unlock at EITHER tier
// (the process set is the engine both tiers run on); `:forjar` requires "forjar" (hub advisory Gap 2 —
// tier-partitioned content gates by sub-tier, never just "has sinkra-os or not"). Unknown pack tags
// fail CLOSED. Untagged skills are never gated — they are not ours to gate. NOT bypassed by --force
// (force repairs drift; it never bypasses licensing).
//
// 055.W1.1 (AC2) — the tag now resolves from the BASE manifest FIRST, falling back to the OVERLAY's
// own manifest (`PROJECT_SKILLS_TIERS`, populated by the sinkra-os plugin channel) only when the base
// has no entry for this name. This is the wiring into the EXISTING seam the story's contract names —
// overlay-sourced skills (the plugin bundle unpacked into `.aiox-project/skills/`) flow through this
// SAME decision point, never a parallel one.
// 055.W2.2 — a namespaced PLUGIN item (`<plugin-id>/<skill>`) must not slip the gate, and getting the
// KEY SHAPE right is the whole fix. QG fix-cycle-1 (HIGH-1) reproduced the first attempt failing OPEN:
// it fell back to the BARE skill name, which is a shape the real producer never emits.
//
// What the producer actually writes, verified in code: a bundle only yields a NAMESPACED item by shipping
// `.claude/skills/<plugin>/<skill>/…`; in exactly that case `plugin_channel.rs:404-409` takes the FIRST
// component after `skills/`, so `top_level_skills == ["<plugin>"]` and `write_plugin_tiers_manifest`
// (`:466-477`) tags the PLUGIN ROOT. A root tag legitimately means "everything this plugin shipped is
// tier X". So the plugin-id fallback is the one that must exist; without it a paid, tier-gated skill
// materialized for a user with NO entitlement.
//
// Resolution order, and why:
//   1. exact `<plugin>/<skill>` — an explicitly namespaced key: unambiguous, most specific.
//   2. `<plugin>` (root)        — what the producer writes; ATTRIBUTABLE (it names this item's own
//                                 plugin), so it cannot be another plugin's tag.
//   3. bare `<skill>`           — LAST, and only for a hand-authored manifest. It is NOT attributable:
//                                 with two plugins in one overlay, plugin A's `review` tag would answer
//                                 for plugin B's `b/review`. Kept so an older/hand-written manifest
//                                 still gates (never fail open), ranked last so it can never outvote an
//                                 attributable tag.
// Steps 1-3 read the OVERLAY manifest ONLY: the base manifest describes the product's own 35 skills, and
// letting it tag a third party's `acme/review` would gate someone else's content by our tag.
function entitlementSkipReason(item) {
  const slash = item.indexOf("/");
  const plugin = slash < 0 ? null : item.slice(0, slash);
  const bare = slash < 0 ? null : item.slice(slash + 1);
  const overlayTag = (key) => (key === null ? undefined : PROJECT_SKILLS_TIERS?.skills?.[key]?.tier);
  const tag =
    SKILLS_TIERS?.skills?.[item]?.tier ??
    overlayTag(item) ??
    overlayTag(plugin) ??
    overlayTag(bare);
  if (!tag || tag === "base") return null;
  const entitledAny = SINKRA_OS_TIER === "mapear" || SINKRA_OS_TIER === "forjar";
  if (tag === "pack:sinkra-os" || tag === "pack:sinkra-os:mapear") return entitledAny ? null : "not-entitled";
  if (tag === "pack:sinkra-os:forjar") return SINKRA_OS_TIER === "forjar" ? null : "not-entitled";
  return "not-entitled"; // unknown pack tag → fail closed
}

function writeSidecar(item, dstItem, src) {
  writeFileSync(
    join(dstItem, SIDECAR),
    JSON.stringify(
      {
        _doc: "AIOX-managed skill sidecar (029.W1.2, D3 ADR-COCKPIT-GLOBAL-SKILLS-PROVISIONING). sha256 = the content the sync last wrote; if the on-disk hash diverges (you edited this skill), the sync SKIPS it instead of overwriting. `aiox-cockpit --install-skills` force-restores the SOT; `--skills-status` reports drift.",
        name: item,
        version: skillVersion(src),
        sha256: hashDir(dstItem),
        installed_at: new Date().toISOString(),
      },
      null,
      2,
    ) + "\n",
  );
}

// AC5 — `--status`: READ-ONLY report of every GLOBAL-managed skill (name, version, drift). Never writes.
function skillsStatus() {
  for (const name of Object.keys(ADAPTERS)) {
    const a = ADAPTERS[name];
    for (const m of a.map) {
      if (m.kind !== "tree" || m.global === false) continue;
      const dst = join(DEST_ROOT, a.dest, m.to);
      const prev = readManifest(join(DEST_ROOT, a.dest, MANIFEST));
      const managed = (prev.managed && prev.managed[m.to]) || [];
      console.log(`[skills-status] ${name} → ${dst} (${managed.length} managed)`);
      for (const item of managed) {
        const dir = join(dst, item);
        if (!existsSync(dir)) {
          console.log(`  ✗ ${item} — missing on disk (still listed as managed)`);
          continue;
        }
        const sc = readSidecar(dir);
        if (!sc || !sc.sha256) {
          console.log(`  ? ${item} — no sidecar yet (pre-029.W1.2 install); next sync writes it`);
          continue;
        }
        const drift = hashDir(dir) !== sc.sha256;
        console.log(
          `  ${drift ? "≠" : "="} ${item} v${sc.version ?? "?"} — ` +
            (drift ? "DRIFT (local edit — sync will skip; --install-skills restores the SOT)" : "ok"),
        );
      }
    }
  }
  return 0;
}

function syncAdapter(name) {
  const a = ADAPTERS[name];
  if (!a) {
    console.error(`[sync] unknown adapter: ${name}`);
    process.exitCode = 1;
    return;
  }
  // A lone sync-references.json.example (the committed template) does NOT count as a project layer — the
  // producer ships it for discovery but has no overlay, so the label/semantics stay byte-identical (story 2.12).
  // Guarded: a non-dir / unreadable .aiox-project must not crash the sync (tolerated as "no project", as before).
  const hasProject = projectHasLayer();
  const targetLabel = GLOBAL ? `GLOBAL ${DEST_ROOT}/${a.dest}` : `${a.dest}`;
  console.log(`[sync] adapter: ${name} → ${targetLabel}${hasProject ? "  (overlay: base ⊕ .aiox-project)" : ""}`);

  const manifestPath = join(DEST_ROOT, a.dest, MANIFEST);
  const prev = GLOBAL ? readManifest(manifestPath) : { managed: {} };
  const nextManaged = {};
  // 029.W1.2 — tree items (re)written THIS run; their sidecars are hashed+written only AFTER
  // materializeReferences below (references land INSIDE skill dirs — hashing earlier would record a
  // hash that immediately diverges, turning every referenced skill into a false local-edit skip).
  const writtenTreeItems = [];

  for (const m of a.map) {
    if (GLOBAL && m.global === false) {
      console.log(`  · ${m.from}: (project-only — skipped in global target)`);
      continue;
    }
    if (!existsSync(join(SOT, m.from)) && !existsSync(join(PROJECT, m.from))) {
      console.log(`  · ${m.from}: (no SOT dir — skipped)`);
      continue;
    }
    const dst = join(DEST_ROOT, a.dest, m.to);
    const resolved = resolveItems(m.from, m.kind);
    const excl = m.exclude || [];
    const selected = excl.length ? resolved.items.filter(([n]) => !excl.includes(n.replace(/\.md$/, ""))) : resolved.items;
    const items = selected.map(([name, src]) => [projectedName(name, m.rename), src]);
    if (new Set(items.map(([name]) => name)).size !== items.length) {
      throw new Error(`[sync] ${name}/${m.to} has colliding item names after projection transform`);
    }
    const baseTotal = resolved.baseItems.filter((n) => !excl.includes(n.replace(/\.md$/, ""))).length;
    const { projCount } = resolved;
    const names = items.map(([n]) => n);
    const unit = m.kind === "tree" ? "skill" : "file";
    // 055.W2.2 — the old label was `(N override base)`, which printed an IMPOSSIBLE arithmetic
    // (`35 base + 3 project = 35 total`) and called destruction an "override".
    // QG fix-cycle-1 (LOW-1): the parenthetical alone was not enough — the SUM itself has to add up, or
    // the headline still reads as nonsense to someone who does not stop to parse the annotation. So
    // `baseCount` is now what the base layer ACTUALLY contributes: total base items minus the ones a
    // declared shadow replaced and the ones a declared shadow withheld. `35 + 3 = 35` becomes
    // `32 base + 3 project (3 declared shadow) = 35 total`, and the raw base total is kept in the
    // annotation so nothing is hidden by making the line pretty.
    const displaced = resolved.shadowed.length + resolved.withheld.length;
    const baseCount = baseTotal - displaced;
    const overlayAnn = [
      resolved.shadowed.length ? `${resolved.shadowed.length} declared shadow` : null,
      resolved.withheld.length ? `${resolved.withheld.length} base withheld` : null,
      resolved.refused.length ? `${resolved.refused.length} REFUSED (undeclared)` : null,
      resolved.collisions && !resolved.shadowed.length ? `${resolved.collisions} override base` : null, // agents/rules — pre-D23 semantics
    ]
      .filter(Boolean)
      .join(", ");
    const displacedAnn = displaced ? ` of ${baseTotal}, ${displaced} displaced by declaration` : "";
    const overlay = projCount ? ` + ${projCount} project ${unit}(s)${overlayAnn ? ` (${overlayAnn})` : ""}` : "";

    // 055.W2.2 (AC4) — shadowing is ANNOUNCED, per item, in BOTH targets. The `(3 override)` buried in a
    // boot summary is the exact anti-pattern D23 names: a mechanism that COUNTS the damage and does not
    // communicate it is indistinguishable from one that never detected it. The catalog entry (055.W3.1)
    // renders the same `overlay.shadows` declaration this reads — this is its data contract, not a
    // second source of truth.
    for (const s of resolved.shadowed) {
      console.log(
        `    ! DECLARED SHADOW: ${m.to}/${s.name} — the overlay "${OVERLAY_SHADOWS?.id}" replaces the base ${unit} of the same name. Reason: ${s.reason}`,
      );
    }
    for (const w of resolved.withheld) {
      console.log(
        `    ! BASE WITHHELD: ${m.to}/${w.base} is NOT projected — declared shadow by plugin ${unit} ${w.by}. Reason: ${w.reason}`,
      );
    }
    // QG fix-cycle-1 (LOW-3) — EXIT CODE POSTURE, decided rather than inherited: a REFUSED shadow warns
    // and the sync still exits 0. It is not an accident and it is not "advisory by neglect":
    //   · the projection produced is CORRECT, not broken — the thing being protected (the base skill) is
    //     intact and materialized. Refusal is the mechanism WORKING, not a failure to complete;
    //   · a non-zero exit here would let ONE third-party plugin with an undeclared collision brick a
    //     user's whole install (`provision.rs` runs `sync.mjs claude` and checks the result) — trading a
    //     per-item refusal for a total-install failure is a strictly worse outcome for the user;
    //   · the place where an undeclared collision SHOULD be fatal is PUBLISH time, in the catalog CI
    //     (D22/`055.W3.3`), which is exactly where D20 puts mechanical, review-free enforcement.
    // Loudness is carried by `console.warn` + the per-item name + the count in the summary line.
    // QG fix-cycle-1 (MEDIUM-2): the remediation text used to say, unconditionally, "declare it in
    // .aiox-project/skills-tiers.json". On a CLIENT that instruction is actively harmful: there, PROJECT
    // *is* the plugin channel's `overlay_root` (`provision.rs` puts the SOT at ~/.aiox/aiox-core, so
    // PROJECT = ~/.aiox/.aiox-project), and `plugin_channel.rs::write_plugin_tiers_manifest` rewrites that
    // file WHOLESALE on every install, then `atomic_swap_overlay` replaces the tree. Hand-editing it is
    // work the next install silently deletes. So the message now names BOTH owners of the file and points
    // a plugin's users at the only durable fix — the plugin's own bundle. See the backlog card
    // `plugin-nao-consegue-declarar-shadow-canal-reescreve-o-manifesto.md`.
    for (const r of resolved.refused) {
      console.warn(
        `    ✗ REFUSED SHADOW (undeclared): .aiox-project/${m.from}/${r} would have overwritten the base ${unit} "${r}" — base KEPT, overlay copy NOT projected (D23). ` +
          `Fix (project's OWN layer, committed): declare it as {"overlay":{"id":"<plugin-id>","shadows":{"${r}":"<why>"}}} in .aiox-project/skills-tiers.json. ` +
          `Fix (layer owned by an INSTALLED PLUGIN — do NOT hand-edit, the next install overwrites it): the declaration must ship in the plugin's own bundle. ` +
          `Either way, namespacing it under .aiox-project/${m.from}/<plugin-id>/${r} keeps both without any declaration.`,
      );
    }

    if (GLOBAL) {
      // ADDITIVE: never blanket-rm the dest (it holds the user's own global items). Prune only
      // AIOX-managed items that vanished from the SOT (previous manifest \ new), then (re)write ours.
      mkdirSync(dst, { recursive: true });
      const prevNames = (prev.managed && prev.managed[m.to]) || [];
      let pruned = 0;
      const keptDrifted = []; // stale-but-edited items we refuse to prune (still tracked as managed)
      for (const stale of prevNames) {
        if (!names.includes(stale)) {
          const staleDir = join(dst, stale);
          // 029.W1.2 — never-clobber extends to pruning: a stale item whose content diverged from the
          // last managed hash is the USER'S edit now; deleting it would destroy that edit silently.
          // 055.W2.2 (AC6) — this is now ALSO the migration path: renaming `<skill>` → `<plugin-id>/<skill>`
          // makes the OLD name stale, so a schema change routes every migrating item through exactly this
          // branch. The guard is therefore load-bearing for migration, not just for SOT deletions: an
          // item the user edited is NOT moved out from under them, it is kept where they left it.
          if (m.kind === "tree" && !FORCE && existsSync(staleDir) && managedSkipReason(staleDir)) {
            console.log(`    ! prune skipped (local edit): ${m.to}/${stale} — left from SOT but content diverged; remove manually or run --install-skills`);
            keptDrifted.push(stale);
            continue;
          }
          rmSync(staleDir, { recursive: true, force: true });
          pruned++;
          // 055.W2.2 — a namespaced item leaves its `<plugin-id>/` dir behind; drop it once it is empty
          // (a plugin fully uninstalled must not leave a phantom namespace root). Never recursive: an
          // empty dir cannot be holding a user edit (the emptiness is CHECKED before the rm).
          if (stale.includes("/")) {
            const nsDir = join(dst, stale.split("/")[0]);
            try {
              if (existsSync(nsDir) && readdirSync(nsDir).length === 0) rmSync(nsDir, { recursive: true, force: true });
            } catch {
              /* best-effort — a non-empty / racing namespace dir is simply left alone */
            }
          }
        }
      }
      let skipped = 0;
      let gatedKept = 0; // pre-existing on disk — left untouched (never deleted, never updated)
      let gatedNew = 0; // never materialized — simply not written on this install
      const managedNames = [];
      for (const [item, src] of items) {
        const dstItem = join(dst, item);
        // 029.W1.3 (D1/D3) — the entitlement half of the D3 skip seam, checked FIRST (a licensing
        // decision outranks a drift decision, and it needs no disk I/O). Non-destructive by
        // construction: we `continue` BEFORE the rmSync, so a pre-existing copy stays byte-intact —
        // it just stops RECEIVING updates (the founder-gated migration semantics, never deletion).
        // It stays in the managed manifest ONLY if present on disk; a fresh non-entitled install
        // never lists (nor materializes) it. NOT bypassed by --force.
        if (m.kind === "tree" && entitlementSkipReason(item)) {
          if (existsSync(dstItem)) {
            managedNames.push(item);
            gatedKept++;
          } else {
            gatedNew++;
          }
          continue;
        }
        // 029.W1.2 (AC2/AC3) — the D3 skip seam: an on-disk hash diverging from the sidecar means the
        // user edited this skill; SKIP instead of clobbering (visible, never silent). No divergence /
        // no sidecar → normal update, exactly as before. `--force` (AC4) restores today's overwrite.
        if (m.kind === "tree" && !FORCE) {
          const reason = managedSkipReason(dstItem);
          if (reason) {
            console.log(`    ! skip (${reason}): ${m.to}/${item} — local content diverges from the last managed hash; run --install-skills to restore the SOT copy`);
            skipped++;
            managedNames.push(item); // stays in the managed manifest — ownership is not released by a skip
            continue;
          }
        }
        rmSync(dstItem, { recursive: true, force: true }); // per-item clean (drop stale inner files)
        copyProjectedItem(src, dstItem, m.transform, item);
        managedNames.push(item);
        if (m.kind === "tree") writtenTreeItems.push([item, dstItem, src]);
      }
      if (gatedKept || gatedNew) {
        console.log(
          `    ! sinkra-os tier gate (tier: ${SINKRA_OS_TIER}): ${gatedNew + gatedKept} skill(s) not materialized/updated` +
            (gatedKept ? ` (${gatedKept} pre-existing kept on disk, untouched)` : ""),
        );
      }
      nextManaged[m.to] = [...managedNames, ...keptDrifted];
      console.log(
        `  · ${m.from} → ${a.dest}/${m.to}: ${baseCount} base ${unit}(s)${displacedAnn}${overlay} = ${managedNames.length} managed` +
          (pruned ? `, ${pruned} stale pruned` : "") + (skipped ? `, ${skipped} skipped (local edit)` : "") +
          " (additive)",
      );
    } else {
      // PROJECT: the whole projection is generated — clean the mapped dir so SOT deletions propagate.
      rmSync(dst, { recursive: true, force: true });
      mkdirSync(dst, { recursive: true });
      for (const [item, src] of items) copyProjectedItem(src, join(dst, item), m.transform, item);
      console.log(`  · ${m.from} → ${a.dest}/${m.to}: ${baseCount} base ${unit}(s)${displacedAnn}${overlay} = ${names.length} total`);
    }
  }

  // D3 — attach on-demand rule references into the skills that enforce them (both targets).
  // 029.W1.2: in GLOBAL non-force mode a drifted (user-edited) skill is NOT touched here either —
  // writing references into it would violate the same never-clobber contract the skip loop enforces.
  // 029.W1.3: an entitlement-gated skill is not touched either (writing references INTO it would be
  // "receiving updates" — exactly what the gate stops); gating applies even under --force.
  if (a.map.some((m) => m.to === "skills")) {
    const shouldTouch = GLOBAL
      ? (skillDir, item) => !entitlementSkipReason(item) && (FORCE || !managedSkipReason(skillDir))
      : undefined;
    const n = materializeReferences(join(DEST_ROOT, a.dest, "skills"), shouldTouch);
    if (n) console.log(`  · materialized ${n} on-demand rule reference(s) → skills/*/references/ (D3)`);
  }

  // 029.W1.2 (AC1) — sidecars for every tree item written THIS run, hashed only now (post-references).
  if (GLOBAL) {
    for (const [item, dstItem, src] of writtenTreeItems) writeSidecar(item, dstItem, src);
    if (writtenTreeItems.length) console.log(`  · wrote ${writtenTreeItems.length} ${SIDECAR} sidecar(s) (D3 hash tracking)`);
  }

  if (GLOBAL) {
    writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          _doc: "AIOX-managed items in this global projection (ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER D7). The sync prunes only items listed here; the user's own global skills/agents are never touched.",
          adapter: name,
          managed: nextManaged,
        },
        null,
        2,
      ),
    );
    console.log(`  · manifest → ${a.dest}/${MANIFEST}`);
  }
}

function projectionSnapshot(dir) {
  const files = new Map();
  if (!existsSync(dir)) return files;
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else {
        const key = relative(dir, path).split("\\").join("/");
        files.set(key, createHash("sha256").update(readFileSync(path)).digest("hex"));
      }
    }
  };
  walk(dir);
  return files;
}

function projectionDifferences(actualDir, expectedDir) {
  const actual = projectionSnapshot(actualDir);
  const expected = projectionSnapshot(expectedDir);
  const names = [...new Set([...actual.keys(), ...expected.keys()])].sort();
  return names.flatMap((name) => {
    if (!actual.has(name)) return [{ kind: "missing", name }];
    if (!expected.has(name)) return [{ kind: "unexpected", name }];
    if (actual.get(name) !== expected.get(name)) return [{ kind: "modified", name }];
    return [];
  });
}

function checkProjectProjections(targets) {
  let failures = 0;
  for (const name of targets) {
    const adapter = ADAPTERS[name];
    if (!adapter) continue;
    for (const mapping of adapter.map) {
      const relativeDir = join(adapter.dest, mapping.to);
      const differences = projectionDifferences(join(ROOT, relativeDir), join(CHECK_ROOT, relativeDir));
      if (!differences.length) {
        console.log(`[projection-check] OK — ${relativeDir.split("\\").join("/")}`);
        continue;
      }
      failures += differences.length;
      console.error(`[projection-check] FAIL — ${relativeDir.split("\\").join("/")} diverges from sync.mjs`);
      for (const difference of differences) {
        console.error(`  ${difference.kind}: ${difference.name}`);
      }
    }
  }
  if (failures) {
    console.error(
      `[projection-check] ${failures} difference(s). Edit .aiox-core/.aiox-project, then run ` +
        "`node .aiox-core/sync/sync.mjs`.",
    );
    return 1;
  }
  console.log("[projection-check] PASS — every generated project projection matches its SOT.");
  return 0;
}

if (CHECK_PROJECTIONS) {
  if (GLOBAL || FORCE || STATUS || flags.includes("--lint-refs") || destRootFlag) {
    console.error("[projection-check] --check-projections is project-only and cannot be combined with target/write flags.");
    process.exitCode = 1;
    rmSync(CHECK_ROOT, { recursive: true, force: true });
  } else {
    const targets = wanted.length ? wanted : Object.keys(ADAPTERS);
    try {
      for (const target of targets) syncAdapter(target);
      process.exitCode = process.exitCode || checkProjectProjections(targets);
    } finally {
      rmSync(CHECK_ROOT, { recursive: true, force: true });
    }
  }
} else if (STATUS) {
  process.exitCode = skillsStatus(); // read-only — never syncs
} else if (flags.includes("--lint-refs")) {
  process.exitCode = lintRefs();
} else {
  const targets = wanted.length ? wanted : Object.keys(ADAPTERS);
  for (const t of targets) syncAdapter(t);
  console.log("[sync] done.");
}
