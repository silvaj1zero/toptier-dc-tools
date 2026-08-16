#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export class GuardError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "GuardError";
    this.code = code;
  }
}

function scalar(value) {
  const trimmed = value.trim();

  // A quoted scalar keeps its content verbatim (a `#` inside quotes is NOT a comment);
  // whatever follows the closing quote is an inline comment.
  const quoted = trimmed.match(/^(["'])(.*?)\1(?:\s+#.*)?$/);
  if (quoted) return quoted[2];

  // A `#` opening the value means the value itself is absent (`field: # note`).
  if (trimmed.startsWith("#")) return "";

  // Plain scalar: YAML opens an inline comment at a whitespace-preceded `#`. The repo's
  // stories annotate frontmatter this way (`deploy_type: none  # sem superfície de deploy`),
  // so not stripping it both rejects valid `involves_ui` and mis-reads `deploy_type`.
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new GuardError("STORY_FRONTMATTER_MISSING", "story must start with YAML frontmatter");

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*$/);
    if (field) fields[field[1]] = scalar(field[2]);
  }
  return fields;
}

function role(value, field) {
  const normalized = String(value ?? "").trim().replace(/^@/, "");
  if (!normalized) throw new GuardError("STORY_FIELD_MISSING", `story field ${field} is required`);
  return normalized;
}

function assertProjectPath(path, root) {
  const fromRoot = relative(root, path);
  if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
    throw new GuardError("STORY_OUTSIDE_PROJECT", "story path must stay inside the current project");
  }
}

export function inspectStory(storyArgument, { cwd = process.cwd() } = {}) {
  if (!storyArgument) throw new GuardError("STORY_PATH_REQUIRED", "full-cycle requires one story path");

  const projectRoot = resolve(cwd);
  const storyPath = resolve(projectRoot, storyArgument);
  assertProjectPath(storyPath, projectRoot);
  if (extname(storyPath).toLowerCase() !== ".md") {
    throw new GuardError("STORY_PATH_INVALID", "story path must resolve to a Markdown file");
  }
  if (!existsSync(storyPath) || !statSync(storyPath).isFile()) {
    throw new GuardError("STORY_PATH_INVALID", "story Markdown file does not exist");
  }

  const text = readFileSync(storyPath, "utf8");
  const fields = frontmatter(text);
  for (const field of ["story_id", "status", "executor", "quality_gate", "deploy_type", "involves_ui"]) {
    if (!fields[field]) throw new GuardError("STORY_FIELD_MISSING", `story field ${field} is required`);
  }
  if (!["true", "false"].includes(fields.involves_ui)) {
    throw new GuardError("STORY_FIELD_INVALID", "story field involves_ui must be true or false");
  }
  // TERMINAL statuses — a story that already reached the end of its lifecycle must never be
  // dispatched again. `Done` was covered from day 1; `Cancelled` was NOT, and that was a real hole:
  // measured 2026-08-09, all 5 `Cancelled` stories in this repo passed this guard and were fully
  // dispatchable. Four of them are epic 001's W2 stories, cancelled because an architectural decision
  // was INVERTED ("browser é janela EXTERNA, não tile no canvas") — dispatching one would rebuild
  // something the project deliberately abandoned. `Cancelled` is as terminal as `Done`; it just got
  // there without a `/close`.
  if (fields.status === "Done" || fields.status === "Cancelled") {
    throw new GuardError("STORY_ALREADY_DONE", `story ${fields.story_id} is already ${fields.status}`);
  }
  if (!/^## Acceptance Criteria\s*$/m.test(text) || !/^## Tasks \/ Subtasks\s*$/m.test(text)) {
    throw new GuardError("STORY_SECTIONS_MISSING", "story must contain Acceptance Criteria and Tasks / Subtasks");
  }

  const executor = role(fields.executor, "executor");
  const qualityGate = role(fields.quality_gate, "quality_gate");
  if (executor === qualityGate) {
    throw new GuardError(
      "ANTI_SELF_VALIDATION_UNRESOLVED",
      "executor and quality_gate must resolve to different native teammates before spawn"
    );
  }

  const plannedRoles = ["po", executor, qualityGate];
  if (fields.involves_ui === "true") plannedRoles.push("design-ops");
  if (fields.deploy_type !== "none") plannedRoles.push("devops");
  const uniqueRoles = [...new Set(plannedRoles)];

  return {
    story_id: fields.story_id,
    story_path: storyPath,
    status: fields.status,
    deploy_type: fields.deploy_type,
    involves_ui: fields.involves_ui === "true",
    planned_roles: uniqueRoles,
    spawn_budget: uniqueRoles.length,
    project_root: projectRoot,
  };
}

export function requireNativeTeamTool(nativeTeamTool) {
  const tool = String(nativeTeamTool ?? "").trim();
  const operations = tool.split("+").map((operation) => operation.trim()).filter(Boolean);
  if (operations.length < 2 || operations.some((operation) => /^(none|external)$/i.test(operation))) {
    throw new GuardError(
      "NATIVE_AGENT_TEAMS_UNAVAILABLE",
      "full-cycle requires native Agent Teams create and message operations in the current transport"
    );
  }
  return tool;
}

export function defaultStatePath(plan) {
  const safeStoryId = plan.story_id.replace(/[^A-Za-z0-9._-]/g, "_");
  return resolve(plan.project_root, ".aiox", "full-cycle", `${safeStoryId}.spawn-budget.json`);
}

function writeState(statePath, state) {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
}

function readState(statePath) {
  let state;
  try {
    state = JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    throw new GuardError("SPAWN_STATE_INVALID", "spawn state is missing, unreadable, or malformed");
  }
  if (
    state.version !== 1 ||
    !Array.isArray(state.planned_roles) ||
    !Array.isArray(state.attempted_roles) ||
    !Number.isInteger(state.spawn_budget) ||
    !Number.isInteger(state.spawn_attempts)
  ) {
    throw new GuardError("SPAWN_STATE_INVALID", "spawn state does not match the v1 guard schema");
  }
  return state;
}

function samePlan(state, plan, nativeTeamTool) {
  return (
    state.story_id === plan.story_id &&
    state.story_path === plan.story_path &&
    state.native_team_tool === nativeTeamTool &&
    state.involves_ui === plan.involves_ui &&
    state.spawn_budget === plan.spawn_budget &&
    JSON.stringify(state.planned_roles) === JSON.stringify(plan.planned_roles)
  );
}

export function initializeState(plan, nativeTeamTool, { statePath = defaultStatePath(plan) } = {}) {
  const tool = requireNativeTeamTool(nativeTeamTool);
  const resolvedStatePath = resolve(statePath);
  if (existsSync(resolvedStatePath)) {
    const existing = readState(resolvedStatePath);
    if (!samePlan(existing, plan, tool)) {
      throw new GuardError("SPAWN_STATE_PLAN_MISMATCH", "existing spawn state cannot be reset or reused for a different plan");
    }
    return { ...existing, state_path: resolvedStatePath };
  }

  const state = {
    version: 1,
    story_id: plan.story_id,
    story_path: plan.story_path,
    native_team_tool: tool,
    involves_ui: plan.involves_ui,
    planned_roles: plan.planned_roles,
    spawn_budget: plan.spawn_budget,
    spawn_attempts: 0,
    attempted_roles: [],
    status: "active",
  };
  writeState(resolvedStatePath, state);
  return { ...state, state_path: resolvedStatePath };
}

export function chargeSpawn(statePath, requestedRole) {
  const resolvedStatePath = resolve(statePath);
  const state = readState(resolvedStatePath);
  const requested = role(requestedRole, "role");
  if (state.status !== "active") {
    throw new GuardError("SPAWN_STATE_NOT_ACTIVE", "completed spawn state cannot be reused");
  }
  if (state.spawn_attempts >= state.spawn_budget) {
    throw new GuardError("SPAWN_BUDGET_EXHAUSTED", "exact full-cycle spawn budget is exhausted");
  }
  if (!state.planned_roles.includes(requested)) {
    throw new GuardError("SPAWN_ROLE_UNPLANNED", `role ${requested} is not in the verified run plan`);
  }
  if (state.attempted_roles.includes(requested)) {
    throw new GuardError("SPAWN_ROLE_ALREADY_ATTEMPTED", `role ${requested} already consumed its spawn attempt`);
  }

  const updated = {
    ...state,
    spawn_attempts: state.spawn_attempts + 1,
    attempted_roles: [...state.attempted_roles, requested],
  };
  writeState(resolvedStatePath, updated);
  return {
    ...updated,
    remaining_spawns: updated.spawn_budget - updated.spawn_attempts,
    state_path: resolvedStatePath,
  };
}

export function completeState(statePath) {
  const resolvedStatePath = resolve(statePath);
  const state = readState(resolvedStatePath);
  if (state.status !== "active") {
    throw new GuardError("SPAWN_STATE_NOT_ACTIVE", "spawn state is already complete");
  }
  if (state.spawn_attempts !== state.spawn_budget) {
    throw new GuardError("SPAWN_PLAN_INCOMPLETE", "all planned role attempts must be charged before completion");
  }
  const updated = { ...state, status: "complete" };
  writeState(resolvedStatePath, updated);
  return { ...updated, state_path: resolvedStatePath };
}

function output(value) {
  process.stdout.write(`${JSON.stringify({ ok: true, ...value })}\n`);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "inspect") {
    output(inspectStory(args[0]));
    return;
  }
  if (command === "require-native-tool") {
    output({ native_team_tool: requireNativeTeamTool(args[0]) });
    return;
  }
  if (command === "init") {
    const plan = inspectStory(args[0]);
    output(initializeState(plan, args[1], args[2] ? { statePath: args[2] } : {}));
    return;
  }
  if (command === "charge") {
    output(chargeSpawn(args[0], args[1]));
    return;
  }
  if (command === "complete") {
    output(completeState(args[0]));
    return;
  }
  throw new GuardError(
    "USAGE",
    "usage: full-cycle-guard.mjs inspect|require-native-tool|init|charge|complete ..."
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    const code = error instanceof GuardError ? error.code : "UNEXPECTED_ERROR";
    process.stderr.write(`${JSON.stringify({ ok: false, code, message: error.message })}\n`);
    process.exitCode = 2;
  }
}
