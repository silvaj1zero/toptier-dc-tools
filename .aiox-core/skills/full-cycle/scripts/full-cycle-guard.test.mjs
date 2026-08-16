import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  GuardError,
  chargeSpawn,
  completeState,
  initializeState,
  inspectStory,
  requireNativeTeamTool,
} from "./full-cycle-guard.mjs";

function fixture(t, overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "aiox-full-cycle-guard-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const storyPath = join(root, "story.md");
  const fields = {
    story_id: "022.W3.1",
    status: "Ready",
    executor: "@dev",
    quality_gate: "@qa",
    deploy_type: "none",
    involves_ui: "false",
    ...overrides,
  };
  writeFileSync(
    storyPath,
    `---\nstory_id: "${fields.story_id}"\nstatus: ${fields.status}\nexecutor: "${fields.executor}"\nquality_gate: "${fields.quality_gate}"\ndeploy_type: ${fields.deploy_type}\ninvolves_ui: ${fields.involves_ui}\n---\n\n## Acceptance Criteria\n\n1. Safe.\n\n## Tasks / Subtasks\n\n- [ ] Task 1\n`
  );
  return { root, storyPath, statePath: join(root, ".aiox", "guard.json") };
}

function hasCode(expected) {
  return (error) => error instanceof GuardError && error.code === expected;
}

test("invalid story argument halts during inspect before any state or spawn plan", (t) => {
  const { root } = fixture(t);
  assert.throws(() => inspectStory("capture.jpg", { cwd: root }), hasCode("STORY_PATH_INVALID"));
  assert.equal(existsSync(join(root, ".aiox")), false);
});

test("invalid UI flag halts before deriving a spawn plan", (t) => {
  const { root, storyPath } = fixture(t, { involves_ui: "maybe" });
  assert.throws(() => inspectStory(storyPath, { cwd: root }), hasCode("STORY_FIELD_INVALID"));
});

test("inline YAML comments do not corrupt the frontmatter fields the plan depends on", (t) => {
  // The repo's stories annotate frontmatter inline (`deploy_type: none  # sem superfície…`).
  // Reading the comment as part of the value both rejected a valid `involves_ui` and silently
  // mis-read `deploy_type: none` as a deploying story, budgeting a devops spawn that Phase 4
  // must never get.
  const { root } = fixture(t);
  const storyPath = join(root, "commented.md");
  writeFileSync(
    storyPath,
    `---\nstory_id: "041.W1.1"\nstatus: Draft\nexecutor: "@dev"   # domínio nativo\nquality_gate: "@qa"\n\n# ── full-line comment: ignored, not a field ──\ndeploy_type: none                  # sem superfície de deploy própria\ninvolves_ui: false                 # zero widget; puro Rust + docs\n---\n\n## Acceptance Criteria\n\n1. Safe.\n\n## Tasks / Subtasks\n\n- [ ] Task 1\n`
  );

  const plan = inspectStory(storyPath, { cwd: root });
  assert.equal(plan.involves_ui, false);
  assert.equal(plan.deploy_type, "none");
  assert.deepEqual(plan.planned_roles, ["po", "dev", "qa"]);
  assert.equal(plan.spawn_budget, 3);
});

test("a `#` inside a quoted scalar stays part of the value", (t) => {
  const { root } = fixture(t, { story_id: "041.W1.1 # not a comment" });
  const plan = inspectStory(join(root, "story.md"), { cwd: root });
  assert.equal(plan.story_id, "041.W1.1 # not a comment");
});

test("missing native Agent Teams capability halts before state initialization", (t) => {
  const { root, storyPath, statePath } = fixture(t);
  const plan = inspectStory(storyPath, { cwd: root });
  assert.throws(
    () => initializeState(plan, "none", { statePath }),
    hasCode("NATIVE_AGENT_TEAMS_UNAVAILABLE")
  );
  assert.throws(
    () => initializeState(plan, "Agent", { statePath }),
    hasCode("NATIVE_AGENT_TEAMS_UNAVAILABLE")
  );
  assert.equal(existsSync(statePath), false);
});

test("transport check requires separate native create and message operations", () => {
  assert.throws(() => requireNativeTeamTool("none"), hasCode("NATIVE_AGENT_TEAMS_UNAVAILABLE"));
  assert.throws(() => requireNativeTeamTool("Agent"), hasCode("NATIVE_AGENT_TEAMS_UNAVAILABLE"));
  assert.equal(requireNativeTeamTool("Agent+SendMessage"), "Agent+SendMessage");
});

test("run plan derives one exact spawn allocation per unique role", (t) => {
  const { root, storyPath } = fixture(t, { deploy_type: "local" });
  const plan = inspectStory(storyPath, { cwd: root });
  assert.deepEqual(plan.planned_roles, ["po", "dev", "qa", "devops"]);
  assert.equal(plan.spawn_budget, 4);
});

test("UI run budgets design-ops before optional devops", (t) => {
  const { root, storyPath } = fixture(t, { involves_ui: "true", deploy_type: "local" });
  const plan = inspectStory(storyPath, { cwd: root });
  assert.deepEqual(plan.planned_roles, ["po", "dev", "qa", "design-ops", "devops"]);
  assert.equal(plan.spawn_budget, 5);
});

test("valid run charges each planned role once and completes within budget", (t) => {
  const { root, storyPath, statePath } = fixture(t);
  const plan = inspectStory(storyPath, { cwd: root });
  initializeState(plan, "Agent+SendMessage", { statePath });
  assert.equal(chargeSpawn(statePath, "po").remaining_spawns, 2);
  assert.equal(chargeSpawn(statePath, "dev").remaining_spawns, 1);
  assert.equal(chargeSpawn(statePath, "qa").remaining_spawns, 0);
  assert.equal(completeState(statePath).status, "complete");
});

test("attempt beyond the exact budget is refused without replenishment", (t) => {
  const { root, storyPath, statePath } = fixture(t);
  const plan = inspectStory(storyPath, { cwd: root });
  initializeState(plan, "spawn_agent+send_message", { statePath });
  for (const plannedRole of plan.planned_roles) chargeSpawn(statePath, plannedRole);
  assert.throws(() => chargeSpawn(statePath, "devops"), hasCode("SPAWN_BUDGET_EXHAUSTED"));
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  assert.equal(state.spawn_attempts, state.spawn_budget);
});

test("unplanned role is rejected before exhaustion without consuming budget", (t) => {
  const { root, storyPath, statePath } = fixture(t);
  const plan = inspectStory(storyPath, { cwd: root });
  initializeState(plan, "spawn_agent+send_message", { statePath });
  chargeSpawn(statePath, "po");
  assert.throws(() => chargeSpawn(statePath, "devops"), hasCode("SPAWN_ROLE_UNPLANNED"));
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  assert.equal(state.spawn_attempts, 1);
  assert.deepEqual(state.attempted_roles, ["po"]);
});

test("a role cannot be retried even while another allocation remains", (t) => {
  const { root, storyPath, statePath } = fixture(t);
  const plan = inspectStory(storyPath, { cwd: root });
  initializeState(plan, "spawn_agent+send_message", { statePath });
  chargeSpawn(statePath, "po");
  assert.throws(() => chargeSpawn(statePath, "po"), hasCode("SPAWN_ROLE_ALREADY_ATTEMPTED"));
});

test("guard has no process-launching or external Terminal fallback surface", () => {
  const source = readFileSync(new URL("./full-cycle-guard.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /node:child_process|osascript|open -a Terminal|AIOX_INLINE_MODE|ttab/);
});
