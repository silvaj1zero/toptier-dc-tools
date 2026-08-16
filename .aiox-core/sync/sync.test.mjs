// Tests for the sync overlay / re-homed-rule escape hatch (story 2.12, ADR-COCKPIT-GLOBAL-FRAMEWORK-LAYER D3).
// Run: node --test .aiox-core/sync/sync.test.mjs   (built-in test runner, dependency-free).
//
// Strategy: each test builds an isolated temp "repo" (a copy of the REAL sync.mjs under <tmp>/.aiox-core/sync/,
// plus fixture rules/skills/overlay), runs the script via spawnSync, and asserts on the generated projections
// plus exit codes. Testing a byte-copy of the real script exercises the real logic with zero prod seams.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, existsSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REAL_SYNC = join(dirname(fileURLToPath(import.meta.url)), "sync.mjs");
const REHOMED = ["agent-authority", "pr-merge-strategy", "complete-findings-resolution", "agent-handoff"];

function w(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

// Build a temp repo: real sync.mjs + the re-homed rules + portable-paths (always-on flat) + given base/project
// skills. `overlay` (object|string|undefined) → .aiox-project/sync-references.json. Returns the repo root.
// `pluginSkills` (055.W2.2) → .aiox-project/skills/<plugin-id>/<skill>/SKILL.md — the NESTED layout that
// makes the namespace a path. `overlayManifest` (object|string) → .aiox-project/skills-tiers.json.
function mkRepo({
  baseSkills = {},
  projectSkills = {},
  pluginSkills = {},
  baseAgents = {},
  projectAgents = {},
  overlay,
  overlayManifest,
  exampleOnly = false,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), "aiox-sync-"));
  mkdirSync(join(root, ".aiox-core/sync"), { recursive: true }); // dest dir must exist before cpSync
  cpSync(REAL_SYNC, join(root, ".aiox-core/sync/sync.mjs"));

  for (const r of REHOMED) w(join(root, ".aiox-core/rules", r + ".md"), `# ${r}\n(re-homed rule)\n`);
  w(join(root, ".aiox-core/rules/portable-paths.md"), "# portable-paths\n(always-on)\n");

  for (const [name, md] of Object.entries(baseSkills)) w(join(root, ".aiox-core/skills", name, "SKILL.md"), md);
  for (const [name, md] of Object.entries(projectSkills)) w(join(root, ".aiox-project/skills", name, "SKILL.md"), md);
  for (const [pluginId, skills] of Object.entries(pluginSkills)) {
    for (const [name, md] of Object.entries(skills)) {
      w(join(root, ".aiox-project/skills", pluginId, name, "SKILL.md"), md);
    }
  }
  for (const [name, md] of Object.entries(baseAgents)) w(join(root, ".aiox-core/agents", name + ".md"), md);
  for (const [name, md] of Object.entries(projectAgents)) w(join(root, ".aiox-project/agents", name + ".md"), md);

  if (overlayManifest !== undefined) {
    const body = typeof overlayManifest === "string" ? overlayManifest : JSON.stringify(overlayManifest, null, 2);
    w(join(root, ".aiox-project/skills-tiers.json"), body);
  }
  if (overlay !== undefined) {
    const body = typeof overlay === "string" ? overlay : JSON.stringify(overlay, null, 2);
    w(join(root, ".aiox-project/sync-references.json"), body);
  }
  if (exampleOnly) w(join(root, ".aiox-project/sync-references.json.example"), '{ "_doc": "template" }\n');
  return root;
}

function run(root, args) {
  const r = spawnSync("node", [join(root, ".aiox-core/sync/sync.mjs"), ...args], { cwd: root, encoding: "utf8" });
  return { status: r.status, out: r.stdout || "", err: r.stderr || "", all: (r.stdout || "") + (r.stderr || "") };
}

const cleanup = [];
function repo(opts) {
  const r = mkRepo(opts);
  cleanup.push(r);
  return r;
}
test.after(() => {
  for (const r of cleanup) rmSync(r, { recursive: true, force: true });
});

test("Codex adapter projects skills with native minimal frontmatter and lowercase names", () => {
  const root = repo({
    baseSkills: {
      "Upper-Skill": `---\nname: Upper-Skill\ndescription: Does <work>: safely > always\ncontext: conversation\nagent: dev\nuser-invocable: true\n---\n\n# Body\n\nKeep me.\n`,
      "Long-Skill": `---\nname: Long-Skill\ndescription: "${"x".repeat(1100)}"\n---\n\n# Long\n`,
    },
  });
  const res = run(root, ["codex"]);
  assert.equal(res.status, 0, res.all);

  const projected = join(root, ".codex/skills/upper-skill/SKILL.md");
  assert.ok(existsSync(projected));
  const text = readFileSync(projected, "utf8");
  assert.match(text, /^---\nname: upper-skill\ndescription: "Does \(work\): safely → always"\n---\n/);
  assert.doesNotMatch(text.split("---", 3)[1], /^(context|agent|user-invocable):/m);
  assert.match(text, /# Body\n\nKeep me\./);
  assert.ok(!existsSync(join(root, ".codex/agents")));
  assert.ok(!existsSync(join(root, ".codex/rules")));

  const longText = readFileSync(join(root, ".codex/skills/long-skill/SKILL.md"), "utf8");
  const longDescription = JSON.parse(longText.match(/^description: (.+)$/m)[1]);
  assert.ok(longDescription.length <= 1024);
  assert.match(longDescription, /…$/);
});

test("Codex adapter projects layered agents as native TOML personas", () => {
  const base = `---
name: sample-agent
description: Uses .claude/rules and <project> safely
tools: Read, Edit
model: sonnet
---

# sample-agent

Follow CLAUDE.md and edit only the .claude SOT projection.
`;
  const project = base.replace("Uses .claude/rules", "Project override uses .claude/rules");
  const root = repo({ baseAgents: { "sample-agent": base }, projectAgents: { "sample-agent": project } });

  const res = run(root, ["codex"]);
  assert.equal(res.status, 0, res.all);
  const projected = join(root, ".codex/agents/sample-agent.toml");
  assert.ok(existsSync(projected));
  assert.equal(
    readFileSync(projected, "utf8"),
    `name = "sample-agent"
description = "Project override uses .Codex/rules and <project> safely"
developer_instructions = """
# sample-agent

Follow AGENTS.md and edit only the .Codex SOT projection."""
`,
  );
  assert.ok(!existsSync(join(root, ".codex/agents/sample-agent.md")));
});

test("projection guard fails on hand-edit and passes after SOT plus sync", () => {
  const root = repo({
    baseSkills: { sample: "---\nname: sample\ndescription: Sample\n---\n\n# Sample\n" },
    baseAgents: {
      sample: "---\nname: sample\ndescription: Sample agent\n---\n\n# sample\n\nOriginal persona.\n",
    },
  });

  const initialSync = run(root, []);
  assert.equal(initialSync.status, 0, initialSync.all);
  const clean = run(root, ["--check-projections"]);
  assert.equal(clean.status, 0, clean.all);
  assert.match(clean.all, /projection-check.*PASS/i);

  const projectedAgent = join(root, ".codex/agents/sample.toml");
  const manualEdit = readFileSync(projectedAgent, "utf8") + "# hand edit\n";
  writeFileSync(projectedAgent, manualEdit);
  const dirty = run(root, ["--check-projections"]);
  assert.equal(dirty.status, 1, dirty.all);
  assert.match(dirty.all, /modified: sample\.toml/);
  assert.equal(readFileSync(projectedAgent, "utf8"), manualEdit, "check must be read-only");

  w(
    join(root, ".aiox-core/agents/sample.md"),
    "---\nname: sample\ndescription: Sample agent\n---\n\n# sample\n\nUpdated through the SOT.\n",
  );
  const resync = run(root, []);
  assert.equal(resync.status, 0, resync.all);
  const repaired = run(root, ["--check-projections"]);
  assert.equal(repaired.status, 0, repaired.all);
  assert.match(readFileSync(projectedAgent, "utf8"), /Updated through the SOT/);
});

test("default sync runs Claude and Codex adapters", () => {
  const root = repo({ baseSkills: { sample: "---\nname: sample\ndescription: Sample skill\n---\n\n# Sample\n" } });
  const res = run(root, []);
  assert.equal(res.status, 0, res.all);
  assert.ok(existsSync(join(root, ".claude/skills/sample/SKILL.md")));
  assert.ok(existsSync(join(root, ".codex/skills/sample/SKILL.md")));
});

// ── AC3 — D3 default preserved (non-regression): no overlay → re-homed rules stay OUT of flat, base skills
//    materialize exactly as today. ───────────────────────────────────────────────────────────────────────
test("AC3: no overlay — re-homed rules excluded from flat; base skill materializes them", () => {
  const root = repo({ baseSkills: { push: "# push skill\n" } });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  for (const r of REHOMED) {
    assert.ok(!existsSync(join(root, ".claude/rules", r + ".md")), `${r} must NOT be projected flat`);
  }
  assert.ok(existsSync(join(root, ".claude/rules/portable-paths.md")), "portable-paths stays always-on flat");
  // base map: push → [agent-authority, pr-merge-strategy]
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")));
  assert.ok(existsSync(join(root, ".claude/skills/push/references/pr-merge-strategy.md")));
});

// ── AC1 + AC2 — overlay reaches a CONSUMER skill. ─────────────────────────────────────────────────────────
test("AC1/AC2: overlay materializes a re-homed rule into a consumer skill", () => {
  const root = repo({
    projectSkills: { "sinkra-push": "# sinkra-push\nsee .claude/rules/agent-authority.md\n" },
    overlay: { "sinkra-push": ["agent-authority", "pr-merge-strategy"] },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.ok(existsSync(join(root, ".claude/skills/sinkra-push/references/agent-authority.md")));
  assert.ok(existsSync(join(root, ".claude/skills/sinkra-push/references/pr-merge-strategy.md")));
});

// ── AC1 — overlay UNIONS over base (extends, never shrinks / mutates the base map). ───────────────────────
test("AC1: overlay unions over a base skill without dropping its base references", () => {
  const root = repo({
    baseSkills: { push: "# push\n" },
    overlay: { push: ["complete-findings-resolution"] }, // extend base push
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  // base two survive …
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")));
  assert.ok(existsSync(join(root, ".claude/skills/push/references/pr-merge-strategy.md")));
  // … and the overlay one is added.
  assert.ok(existsSync(join(root, ".claude/skills/push/references/complete-findings-resolution.md")));
});

// ── AC2 — skill in overlay but absent on disk → silent skip, sync still succeeds. ─────────────────────────
test("AC2: overlay entry for a non-existent skill is skipped silently (no abort)", () => {
  const root = repo({ baseSkills: { push: "# push\n" }, overlay: { "ghost-skill": ["agent-authority"] } });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.ok(!existsSync(join(root, ".claude/skills/ghost-skill")), "ghost skill not created");
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")), "base still works");
});

// ── AC1 — malformed overlay → warn + ignore, never aborts, base behaviour intact. ────────────────────────
test("AC1: malformed overlay JSON → warns and falls back to base (no abort)", () => {
  const root = repo({ baseSkills: { push: "# push\n" }, overlay: "{ this is not json " });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /malformed/i);
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")), "base preserved");
});

test("AC1: wrong-shape overlay (array, not object) → warns and falls back to base", () => {
  const root = repo({ baseSkills: { push: "# push\n" }, overlay: "[1,2,3]" });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /must be an object/i);
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")));
});

// ── hardening (self-heal MEDIUM) — a path-like overlay rule name is rejected, cannot escape references/. ──
test("overlay rule name with a path separator is rejected (no traversal), sync still succeeds", () => {
  const root = repo({
    baseSkills: { push: "# push\n" },
    overlay: { push: ["../../evil", "agent-authority"] },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /not a bare rule name/i);
  // the valid one still materializes; the path-like one produced no escaping write.
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")));
  assert.ok(!existsSync(join(root, ".claude/skills/push/references/../../evil.md")));
  assert.ok(!existsSync(join(root, "evil.md")));
});

// ── hardening (QG self-heal HIGH) — a path-like overlay KEY (skill) is rejected, cannot escape skills/. ──
test("overlay skill KEY with a path separator is rejected (no traversal out of skills/)", () => {
  const root = repo({ baseSkills: { push: "# push\n" }, overlay: { "../../evil-skill": ["agent-authority"] } });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /not a bare skill name/i);
  assert.ok(!existsSync(join(root, "evil-skill")), "no skill dir created outside the projection");
  assert.ok(!existsSync(join(root, ".claude/skills/../../evil-skill")));
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")), "base still works");
});

// ── hardening (QG self-heal MEDIUM) — a prototype-polluting KEY does not crash the never-abort guarantee. ─
test("overlay key 'constructor'/'__proto__' is handled without crashing (null-proto map)", () => {
  const root = repo({
    baseSkills: { push: "# push\n" },
    overlay: { constructor: ["agent-authority"], __proto__: ["pr-merge-strategy"], push: ["agent-handoff"] },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all); // must NOT throw/abort
  // 'constructor' is a valid token but that skill doesn't exist on disk → silently skipped, no crash.
  // '__proto__' has underscores → rejected as not a bare name. push extends via a valid overlay entry.
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-handoff.md")), "valid entry applied");
});

// ── story 2.12 refinement — a lone .example does NOT flip the producer into overlay mode. ─────────────────
test("example-only .aiox-project does not report an overlay and keeps output identical", () => {
  const root = repo({ baseSkills: { push: "# push\n" }, exampleOnly: true });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.doesNotMatch(res.out, /overlay: base ⊕/, "lone .example must not claim an overlay");
  for (const r of REHOMED) assert.ok(!existsSync(join(root, ".claude/rules", r + ".md")));
  assert.ok(existsSync(join(root, ".claude/skills/push/references/agent-authority.md")));
});

// ── AC4 — lint flags an orphaned re-homed reference; clean when reachable. ────────────────────────────────
test("AC4: --lint-refs flags a SKILL.md citing a re-homed rule not materialized for it", () => {
  const root = repo({
    projectSkills: { "sinkra-full-cycle": "# sinkra-full-cycle\nfollow .claude/rules/agent-authority.md\n" },
    // no overlay → agent-authority is re-homed and not materialized for this skill
  });
  const res = run(root, ["--lint-refs"]);
  assert.equal(res.status, 1, "orphan must produce non-zero exit");
  assert.match(res.all, /sinkra-full-cycle/);
  assert.match(res.all, /agent-authority/);
});

test("AC4: --lint-refs is clean when the cited rule is materialized via overlay", () => {
  const root = repo({
    projectSkills: { "sinkra-full-cycle": "# sinkra-full-cycle\nfollow .claude/rules/agent-authority.md\n" },
    overlay: { "sinkra-full-cycle": ["agent-authority"] },
  });
  const res = run(root, ["--lint-refs"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /OK/);
});

test("AC4: --lint-refs is clean for a reference to an always-on flat rule", () => {
  const root = repo({
    projectSkills: { "sinkra-push": "# sinkra-push\nsee .claude/rules/portable-paths.md\n" },
  });
  const res = run(root, ["--lint-refs"]);
  assert.equal(res.status, 0, res.all);
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// Story 055.W2.2 (D23/D24(a)) — namespace obrigatório por plugin.
// Fixture note: `skill()` gives every skill a DISTINCT body, so "which copy landed here" is provable by
// content and never inferred from the path alone.
// ══════════════════════════════════════════════════════════════════════════════════════════════════

const skill = (name, marker) => `---\nname: ${name}\ndescription: ${marker} copy of ${name}\n---\n\n# ${marker}\n`;

const manifest = (id, shadows) => ({
  overlay: shadows === undefined ? { id } : { id, shadows },
  skills: {},
});

// ── AC1 — plugin content materializes under <plugin-id>/<skill>, NEVER under the bare name. ─────────
test("055.W2.2 AC1: a plugin skill materializes at <plugin-id>/<skill>, never at the bare name", () => {
  const root = repo({
    baseSkills: { close: skill("close", "base") },
    pluginSkills: { acme: { deploy: skill("deploy", "acme") } },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  assert.ok(existsSync(join(root, ".claude/skills/acme/deploy/SKILL.md")), "plugin skill must be namespaced");
  assert.ok(!existsSync(join(root, ".claude/skills/deploy")), "plugin skill must NOT take the bare name");
  assert.match(readFileSync(join(root, ".claude/skills/acme/deploy/SKILL.md"), "utf8"), /# acme/);
  // the base skill is untouched by an unrelated plugin
  assert.match(readFileSync(join(root, ".claude/skills/close/SKILL.md"), "utf8"), /# base/);
});

// ── AC2 — the collision is NOT REPRESENTABLE. Two plugins ship the same skill name; both land, intact,
//    at distinct paths, and the sync reports zero collisions because there is none to report. ────────
test("055.W2.2 AC2: two plugins shipping the same skill name both materialize — collision not representable", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    pluginSkills: {
      acme: { review: skill("review", "acme") },
      globex: { review: skill("review", "globex") },
    },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  // three DISTINCT `review` skills coexist — nothing overwrote anything.
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/);
  assert.match(readFileSync(join(root, ".claude/skills/acme/review/SKILL.md"), "utf8"), /# acme/);
  assert.match(readFileSync(join(root, ".claude/skills/globex/review/SKILL.md"), "utf8"), /# globex/);
  // …and no shadow/override was even considered: a namespaced name can never equal a base key.
  assert.doesNotMatch(res.all, /DECLARED SHADOW|REFUSED SHADOW|BASE WITHHELD|override base/);
  assert.match(res.all, /2 project skill\(s\) = 3 total/, res.all);
});

// ── AC3 negative — undeclared shadowing does NOT happen: the base skill stays, the overlay copy is
//    refused, and the refusal is loud (AC4). ──────────────────────────────────────────────────────
test("055.W2.2 AC3: an UNDECLARED overlay skill does not shadow the base — base kept, overlay refused", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    projectSkills: { review: skill("review", "overlay") },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/, "base MUST survive");
  assert.match(res.all, /REFUSED SHADOW \(undeclared\)/);
  assert.match(res.all, /1 REFUSED \(undeclared\)/);
});

// ── AC3 positive — declared in the manifest → it shadows, and says so with the stated reason. ───────
test("055.W2.2 AC3/AC4: a DECLARED shadow replaces the base skill and announces itself with its reason", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    projectSkills: { review: skill("review", "overlay") },
    overlayManifest: manifest("aiox-cockpit", { review: "a versão desta empresa do /review" }),
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# overlay/);
  assert.match(res.all, /DECLARED SHADOW: skills\/review/);
  assert.match(res.all, /aiox-cockpit/);
  assert.match(res.all, /a versão desta empresa do \/review/);
  assert.match(res.all, /1 declared shadow/);
});

// ── AC1 + AC3 — the Enterprise case: a PLUGIN declares the shadow. Its copy stays namespaced (AC1) and
//    the BASE skill is withheld from the projection, announced. ──────────────────────────────────────
test("055.W2.2 AC3: a plugin's DECLARED shadow withholds the base skill while staying namespaced", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base"), close: skill("close", "base") },
    pluginSkills: { acme: { review: skill("review", "acme") } },
    overlayManifest: manifest("acme", { review: "o /review da minha empresa" }),
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);

  assert.ok(!existsSync(join(root, ".claude/skills/review")), "the base skill is withheld by the declared shadow");
  assert.match(readFileSync(join(root, ".claude/skills/acme/review/SKILL.md"), "utf8"), /# acme/);
  assert.ok(existsSync(join(root, ".claude/skills/close/SKILL.md")), "an undeclared base skill is untouched");
  assert.match(res.all, /BASE WITHHELD: skills\/review/);
  assert.match(res.all, /o \/review da minha empresa/);
});

// ── AC3 — a declaration for a skill the overlay does not ship withholds NOTHING. ────────────────────
test("055.W2.2 AC3: declaring a shadow you do not ship withholds nothing", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    pluginSkills: { acme: { deploy: skill("deploy", "acme") } },
    overlayManifest: manifest("acme", { review: "declarado mas não entregue" }),
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/);
  assert.doesNotMatch(res.all, /BASE WITHHELD/);
});

// ── AC7 / fail-closed — shadows without a valid `overlay.id` are refused wholesale (a shadow must be
//    attributable), and so is a shadow with no stated reason. ────────────────────────────────────────
test("055.W2.2: shadows without a valid overlay.id are refused wholesale (fail-closed)", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    projectSkills: { review: skill("review", "overlay") },
    overlayManifest: { overlay: { shadows: { review: "sem id" } }, skills: {} },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /without a valid "overlay"\.id/);
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/);
  assert.match(res.all, /REFUSED SHADOW/);
});

test("055.W2.2: a shadow declared with an empty reason is ignored (base kept)", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    projectSkills: { review: skill("review", "overlay") },
    overlayManifest: manifest("acme", { review: "   " }),
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /non-empty reason string/);
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/);
});

test("055.W2.2: a malformed skills-tiers.json never aborts the sync and grants no shadow", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    projectSkills: { review: skill("review", "overlay") },
    overlayManifest: "{ not json at all",
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/);
});

// ── hardening — a path-like plugin id cannot escape skills/. ─────────────────────────────────────────
test("055.W2.2: a plugin dir that is neither a skill nor a safe id is skipped (no traversal)", () => {
  const root = repo({ baseSkills: { close: skill("close", "base") } });
  w(join(root, ".aiox-project/skills/.evil/x/SKILL.md"), skill("x", "evil"));
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /neither a skill \(no SKILL\.md\) nor a valid plugin id/);
  assert.ok(!existsSync(join(root, ".claude/skills/.evil")));
  assert.ok(existsSync(join(root, ".claude/skills/close/SKILL.md")));
});

test("055.W2.2: an overlay dir with neither SKILL.md nor plugin skills warns and is skipped", () => {
  const root = repo({ baseSkills: { close: skill("close", "base") } });
  w(join(root, ".aiox-project/skills/empty-thing/notes.md"), "# not a skill\n");
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /holds no plugin skills/);
  assert.ok(!existsSync(join(root, ".claude/skills/empty-thing")));
});

// ── self-heal (own adversarial pass) — a plugin id equal to an existing skill name would make
//    <dest>/skills/<id> be BOTH a skill dir and a namespace root: cpSync would nest the plugin inside
//    that skill and the GLOBAL per-item rmSync would then delete it, order-dependently. ──────────────
test("055.W2.2: a plugin id colliding with a base skill name is refused (the base skill is not corrupted)", () => {
  const root = repo({
    baseSkills: { acme: skill("acme", "base") },
    pluginSkills: { acme: { review: skill("review", "acme") } },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(res.all, /plugin id "acme" collides with an existing skills item/);
  assert.match(readFileSync(join(root, ".claude/skills/acme/SKILL.md"), "utf8"), /# base/);
  assert.ok(!existsSync(join(root, ".claude/skills/acme/review")), "the base skill dir must not be nested into");
});

// The first-party half of the same question needs no guard, and this test is why: an overlay dir that
// holds a SKILL.md IS a skill and is never descended into, so its sub-dirs are its own content (assets,
// templates) — they can never be mistaken for plugin skills. The two roles are the same directory entry,
// so a first-party name and a plugin id are mutually exclusive by construction.
test("055.W2.2: an overlay dir with SKILL.md is a skill — its sub-dirs are content, not plugin skills", () => {
  const root = repo({
    projectSkills: { acme: skill("acme", "first-party") },
    pluginSkills: { acme: { review: skill("review", "nested-asset") } },
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(readFileSync(join(root, ".claude/skills/acme/SKILL.md"), "utf8"), /# first-party/);
  // the sub-dir travels as part of the skill, and is NOT projected as an item of its own
  assert.match(readFileSync(join(root, ".claude/skills/acme/review/SKILL.md"), "utf8"), /# nested-asset/);
  assert.match(res.all, /1 project skill\(s\) = 1 total/, res.all);
});

// ── self-heal — a declaration is ATTRIBUTABLE or it is not a declaration: plugin B must not withhold a
//    base skill through plugin A's manifest. ────────────────────────────────────────────────────────
test("055.W2.2: a plugin cannot withhold a base skill through ANOTHER plugin's declaration", () => {
  const root = repo({
    baseSkills: { review: skill("review", "base") },
    pluginSkills: { globex: { review: skill("review", "globex") } },
    overlayManifest: manifest("acme", { review: "declaração da acme, não da globex" }),
  });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(readFileSync(join(root, ".claude/skills/review/SKILL.md"), "utf8"), /# base/, "base survives");
  assert.match(readFileSync(join(root, ".claude/skills/globex/review/SKILL.md"), "utf8"), /# globex/);
  assert.doesNotMatch(res.all, /BASE WITHHELD/);
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// The entitlement gate must not FAIL OPEN on a namespaced item, and the KEY SHAPE is the whole test.
//
// QG fix-cycle-1 (HIGH-1): the first version of this suite asserted ONLY the bare-skill-name key. That
// is a shape the real producer never emits — so the gate was green against a contract that cannot occur
// while failing open on the one that will. The chain, verified in code:
//   a bundle yields a NAMESPACED item only by shipping `.claude/skills/<plugin>/<skill>/…`; in exactly
//   that case `plugin_channel.rs:404-409` takes the FIRST component after `skills/`, so
//   `top_level_skills == ["<plugin>"]` and `write_plugin_tiers_manifest` tags the PLUGIN ROOT.
// `keyShapes` therefore drives the SAME scenario through every key shape that can reach this gate. If a
// future producer changes the key, this table is where it gets declared — not a comment.
// ══════════════════════════════════════════════════════════════════════════════════════════════════

const keyShapes = [
  // [label, tier-manifest `skills` map, why this shape exists]
  ["PLUGIN ID (what write_plugin_tiers_manifest actually writes)", { acme: { tier: "pack:sinkra-os:forjar" } }],
  ["explicit namespaced key", { "acme/forge": { tier: "pack:sinkra-os:forjar" } }],
  ["bare skill name (hand-authored / legacy manifest)", { forge: { tier: "pack:sinkra-os:forjar" } }],
];

for (const [label, skills] of keyShapes) {
  test(`055.W2.2 HIGH-1: tier-gated PLUGIN skill stays gated — manifest keyed by ${label}`, () => {
    const root = repo({
      pluginSkills: { acme: { forge: skill("forge", "acme") } },
      overlayManifest: { overlay: { id: "acme" }, skills },
    });
    const dest = globalDest();

    const none = run(root, ["--global", `--dest-root=${dest}`, "claude"]); // no --sinkra-os-tier = NOT entitled
    assert.equal(none.status, 0, none.all);
    assert.ok(
      !existsSync(join(dest, ".claude/skills/acme/forge")),
      `FAIL OPEN: a paid, tier-gated skill materialized for an unentitled user (manifest keyed by ${label})`,
    );
    assert.match(none.all, /sinkra-os tier gate \(tier: none\)/, "the gate must SAY it gated");

    const entitled = run(root, ["--global", `--dest-root=${dest}`, "--sinkra-os-tier=forjar", "claude"]);
    assert.equal(entitled.status, 0, entitled.all);
    assert.ok(existsSync(join(dest, ".claude/skills/acme/forge/SKILL.md")), "…and materializes once entitled");
  });
}

// Sub-tier precision must survive the plugin-root key too: a root tagged `:forjar` must NOT unlock at
// `mapear` (hub advisory Gap 2 — tier-partitioned content gates by SUB-tier, never "has sinkra-os or not").
test("055.W2.2 HIGH-1: a plugin-root `:forjar` tag does not unlock at tier=mapear", () => {
  const root = repo({
    pluginSkills: { acme: { forge: skill("forge", "acme") } },
    overlayManifest: { overlay: { id: "acme" }, skills: { acme: { tier: "pack:sinkra-os:forjar" } } },
  });
  const dest = globalDest();
  const mapear = run(root, ["--global", `--dest-root=${dest}`, "--sinkra-os-tier=mapear", "claude"]);
  assert.equal(mapear.status, 0, mapear.all);
  assert.ok(!existsSync(join(dest, ".claude/skills/acme/forge")), "forjar content must not unlock at mapear");
});

// Attribution beats specificity: the plugin-root tag (which NAMES this item's own plugin) must outrank
// the bare-name key, because a bare key is answerable by ANY plugin sharing the overlay. Here the bare
// `forge` says `base` (ungated) and the root says `:forjar` — the gate must hold.
test("055.W2.2 HIGH-1: an attributable plugin-root tag outranks an ambiguous bare-name tag", () => {
  const root = repo({
    pluginSkills: { acme: { forge: skill("forge", "acme") } },
    overlayManifest: {
      overlay: { id: "acme" },
      skills: { acme: { tier: "pack:sinkra-os:forjar" }, forge: { tier: "base" } },
    },
  });
  const dest = globalDest();
  const none = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(none.status, 0, none.all);
  assert.ok(!existsSync(join(dest, ".claude/skills/acme/forge")), "a bare `base` tag must not ungate a gated plugin");
});

// MEDIUM-1 — the gate is asked in ONE key shape at EVERY call site. `materializeReferences`'s
// `shouldTouch` used to recover the name with `basename(skillDir)`, converting `<plugin>/<skill>` back to
// a bare `<skill>`: the same mismatch class as HIGH-1. With a namespaced SKILL_REFS key, a gated skill
// kept on disk (`gatedKept`) would otherwise RECEIVE reference writes — exactly what the gate forbids.
test("055.W2.2 MEDIUM-1: both gate call sites use the same key shape (no basename flattening)", () => {
  const src = readFileSync(REAL_SYNC, "utf8");
  const code = src
    .split(/\r?\n/)
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)) // drop comment-only lines — prose may still cite the old form
    .join("\n");
  assert.doesNotMatch(code, /entitlementSkipReason\(\s*basename/, "the gate must never be asked with a flattened name");
  assert.doesNotMatch(code, /^import \{[^}]*\bbasename\b/m, "the basename import must be gone (no way back in)");
  // both call sites pass an item NAME straight through, in the SAME shape
  assert.match(code, /if \(m\.kind === "tree" && entitlementSkipReason\(item\)\)/);
  assert.match(code, /\(skillDir, item\) => !entitlementSkipReason\(item\)/);
});

// ── self-heal (QG engine `coderabbit`) — a nested child dropped by SAFE_NAME / missing SKILL.md must
//    SPEAK even when a valid sibling keeps the plugin alive. Silence there is the defect class this very
//    story removes, reintroduced on the new surface. ─────────────────────────────────────────────────
test("055.W2.2: a rejected child of a LIVE plugin is reported, not dropped in silence", () => {
  const root = repo({ pluginSkills: { acme: { review: skill("review", "acme") } } });
  w(join(root, ".aiox-project/skills/acme/Bad_Name/SKILL.md"), skill("bad", "acme")); // invalid token
  w(join(root, ".aiox-project/skills/acme/no-skill-md/notes.md"), "# not a skill\n"); // no SKILL.md

  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.ok(existsSync(join(root, ".claude/skills/acme/review/SKILL.md")), "the valid sibling still lands");
  assert.match(res.all, /acme\/Bad_Name is not a projectable plugin skill \(name is not a bare kebab token\)/);
  assert.match(res.all, /acme\/no-skill-md is not a projectable plugin skill \(no SKILL\.md\)/);
  assert.ok(!existsSync(join(root, ".claude/skills/acme/Bad_Name")));
  assert.ok(!existsSync(join(root, ".claude/skills/acme/no-skill-md")));
});

// ── non-regression — D23 covers SKILLS. agents/rules keep the pre-D23 "project wins wholly". ─────────
test("055.W2.2: agents keep pre-D23 layered semantics (project wins, no declaration needed)", () => {
  const base = "---\nname: sample\ndescription: base agent\n---\n\n# sample\n\nBase.\n";
  const proj = "---\nname: sample\ndescription: overlay agent\n---\n\n# sample\n\nOverlay.\n";
  const root = repo({ baseAgents: { sample: base }, projectAgents: { sample: proj } });
  const res = run(root, ["claude"]);
  assert.equal(res.status, 0, res.all);
  assert.match(readFileSync(join(root, ".claude/agents/sample.md"), "utf8"), /Overlay\./);
  assert.match(res.all, /1 override base/);
});

// ── Codex projection of a namespaced skill: dir keeps the path, declared name uses <plugin>:<skill>. ─
test("055.W2.2: codex projects a namespaced skill as <plugin-id>:<skill> in its frontmatter", () => {
  const root = repo({ pluginSkills: { acme: { review: skill("review", "acme") } } });
  const res = run(root, ["codex"]);
  assert.equal(res.status, 0, res.all);
  const text = readFileSync(join(root, ".codex/skills/acme/review/SKILL.md"), "utf8");
  assert.match(text, /^---\nname: acme:review\n/);
});

// ── AC4 — --lint-refs reaches INTO the namespace (the hole the namespace itself would have opened). ──
test("055.W2.2: --lint-refs lints namespaced plugin skills too", () => {
  const root = repo({
    pluginSkills: { acme: { "acme-push": "# acme-push\nfollow .claude/rules/agent-authority.md\n" } },
  });
  const res = run(root, ["--lint-refs"]);
  assert.equal(res.status, 1, "a plugin skill's orphaned reference must not be invisible");
  assert.match(res.all, /acme\/acme-push/);
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// AC6 — migration in the GLOBAL target. Renaming <skill> → <plugin-id>/<skill> makes the OLD name
// STALE, which routes it to the PRUNE path — precisely where a user's local edit would die silently.
// Both never-clobber call sites are covered: the prune and the update-skip.
// ══════════════════════════════════════════════════════════════════════════════════════════════════

function globalDest() {
  const dest = mkdtempSync(join(tmpdir(), "aiox-global-"));
  cleanup.push(dest);
  return dest;
}

test("055.W2.2 AC6: an INTACT item migrates from the bare name to <plugin-id>/<skill>", () => {
  const root = repo({ projectSkills: { helper: skill("helper", "v1") } });
  const dest = globalDest();

  const first = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(first.status, 0, first.all);
  assert.ok(existsSync(join(dest, ".claude/skills/helper/SKILL.md")), "pre-migration layout");

  // the schema change: the same skill now ships under a plugin namespace.
  rmSync(join(root, ".aiox-project/skills/helper"), { recursive: true, force: true });
  w(join(root, ".aiox-project/skills/acme/helper/SKILL.md"), skill("helper", "v1"));

  const second = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(second.status, 0, second.all);
  assert.ok(existsSync(join(dest, ".claude/skills/acme/helper/SKILL.md")), "migrated to the namespace");
  assert.ok(!existsSync(join(dest, ".claude/skills/helper")), "stale bare name pruned");
  assert.match(second.all, /1 stale pruned/);
  const managed = JSON.parse(readFileSync(join(dest, ".claude/.aiox-sync-manifest.json"), "utf8"));
  assert.deepEqual(managed.managed.skills, ["acme/helper"]);
});

test("055.W2.2 AC6: a LOCALLY EDITED item is NOT destroyed by the migration (prune never-clobber)", () => {
  const root = repo({ projectSkills: { helper: skill("helper", "v1") } });
  const dest = globalDest();

  assert.equal(run(root, ["--global", `--dest-root=${dest}`, "claude"]).status, 0);
  const edited = join(dest, ".claude/skills/helper/SKILL.md");
  const userText = readFileSync(edited, "utf8") + "\n<!-- o usuário editou isto -->\n";
  writeFileSync(edited, userText);

  rmSync(join(root, ".aiox-project/skills/helper"), { recursive: true, force: true });
  w(join(root, ".aiox-project/skills/acme/helper/SKILL.md"), skill("helper", "v2"));

  const second = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(second.status, 0, second.all);
  assert.match(second.all, /prune skipped \(local edit\): skills\/helper/);
  assert.equal(readFileSync(edited, "utf8"), userText, "the user's edit survives the rename byte-for-byte");
  assert.ok(existsSync(join(dest, ".claude/skills/acme/helper/SKILL.md")), "the new namespaced copy still lands");
  const managed = JSON.parse(readFileSync(join(dest, ".claude/.aiox-sync-manifest.json"), "utf8"));
  assert.deepEqual(managed.managed.skills.sort(), ["acme/helper", "helper"]);
});

test("055.W2.2 AC6: the UPDATE-SKIP call site still protects a locally edited namespaced skill", () => {
  const root = repo({ pluginSkills: { acme: { helper: skill("helper", "v1") } } });
  const dest = globalDest();

  assert.equal(run(root, ["--global", `--dest-root=${dest}`, "claude"]).status, 0);
  const edited = join(dest, ".claude/skills/acme/helper/SKILL.md");
  const userText = readFileSync(edited, "utf8") + "\n<!-- edição local -->\n";
  writeFileSync(edited, userText);

  w(join(root, ".aiox-project/skills/acme/helper/SKILL.md"), skill("helper", "v2")); // upstream moved on

  const second = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(second.status, 0, second.all);
  assert.match(second.all, /skip \(local-edit\): skills\/acme\/helper/);
  assert.equal(readFileSync(edited, "utf8"), userText, "update must not clobber the local edit");

  // …and --force is still the documented repair path (029.W1.2 AC4), namespace included.
  const forced = run(root, ["--global", `--dest-root=${dest}`, "--force", "claude"]);
  assert.equal(forced.status, 0, forced.all);
  assert.match(readFileSync(edited, "utf8"), /# v2/, "--force restores the SOT copy");
});

test("055.W2.2 AC6: uninstalling a plugin prunes its skills and leaves no phantom namespace dir", () => {
  const root = repo({ pluginSkills: { acme: { helper: skill("helper", "v1") } } });
  const dest = globalDest();

  assert.equal(run(root, ["--global", `--dest-root=${dest}`, "claude"]).status, 0);
  assert.ok(existsSync(join(dest, ".claude/skills/acme/helper")));

  rmSync(join(root, ".aiox-project/skills/acme"), { recursive: true, force: true });
  const second = run(root, ["--global", `--dest-root=${dest}`, "claude"]);
  assert.equal(second.status, 0, second.all);
  assert.ok(!existsSync(join(dest, ".claude/skills/acme")), "the namespace root goes with its last skill");
});
