#!/usr/bin/env node
//
// lag-query.mjs — shared Phase-0 LAG query mechanism (Story 031.W4.3, AC2).
//
// One reusable helper any skill can import to consult the Living Architecture Graph (031.W4.1's
// `aiox-core lag-mcp` headless MCP server) instead of reinventing an MCP client per skill. Spawns the
// compiled `aiox-core` binary as a subprocess, speaks the same line-delimited JSON-RPC 2.0 the server
// implements (`crates/aiox-core/src/lag_mcp.rs::run_lag_mcp_loop`), and returns a structured result
// that is ALWAYS safe to consume even when the graph/binary is absent (AC7 — graceful fallback, never
// a silent failure nor a hang).
//
// REUSE > ADAPT > CREATE (031.W4.1 Dev Notes): this does not reimplement MCP access — it is the ONE
// place that knows how to reach `aiox-core lag-mcp`. Skills call `queryGraph`/`listAdrs`/`readAdr`
// (thin typed wrappers) or `callLagTool` (generic) instead of spawning a subprocess themselves.
//
// AP5 (skill-agnosticism, `.aiox-core/rules/skill-agnosticism.md`): this module has ZERO dependency on
// any orchestrator (`/full-cycle`, `/wave-execute`, conductor env vars). It only needs a `projectRoot`
// (defaults to `process.cwd()`) — any skill, standalone or orchestrated, can call it identically.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/** Structured, always-safe result shape — callers branch on `.available`, never on a thrown error for
 * the "graph absent" case (that is expected/normal, not exceptional — AC7). */
export class LagUnavailable {
  constructor(reason) {
    this.available = false;
    this.reason = reason;
  }
}

export class LagResult {
  constructor(payload) {
    this.available = true;
    this.payload = payload;
  }
}

/** Locate a built `aiox-core` binary near `projectRoot`. Checks the conventional cargo output dirs in
 * priority order (release first — the shipped binary — then debug, the dev-loop binary). Returns
 * `null` (never throws) when nothing is found — the caller degrades gracefully (AC7). No hardcoded
 * machine path (portable-paths.md): every candidate is resolved from `projectRoot` at call time. */
export function resolveLagMcpBinary(projectRoot = process.cwd()) {
  const exeName = process.platform === "win32" ? "aiox-core.exe" : "aiox-core";
  const candidates = [
    join(projectRoot, "target", "release", exeName),
    join(projectRoot, "target", "debug", exeName),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** Default per-call timeout — a hung subprocess must never hang the calling skill (AC7's "nunca...
 * trava"). Overridable via the `timeoutMs` option for callers with different latency budgets. */
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Call one LAG MCP tool (`query_graph`/`list_adrs`/`read_adr`/`blast_radius`/`drift_check`/
 * `entity_context` — the 6 tools of `031.W4.1`) and return a structured, never-throwing result.
 *
 * @param {string} toolName - one of the 6 tool names the server advertises.
 * @param {object} args - tool arguments; `project_root` is injected automatically from `projectRoot`.
 * @param {object} [opts]
 * @param {string} [opts.projectRoot] - defaults to `process.cwd()`.
 * @param {number} [opts.timeoutMs] - defaults to 5000ms.
 * @returns {Promise<LagResult|LagUnavailable>}
 */
export async function callLagTool(toolName, args = {}, opts = {}) {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const binary = resolveLagMcpBinary(projectRoot);
  if (!binary) {
    return new LagUnavailable(
      "aiox-core binary not found under target/release or target/debug — LAG not available, falling back"
    );
  }

  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: toolName, arguments: { project_root: projectRoot, ...args } },
  };

  let child;
  try {
    child = spawn(binary, ["lag-mcp", "--root", projectRoot], {
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    return new LagUnavailable(`failed to spawn aiox-core lag-mcp: ${err.message}`);
  }

  return new Promise((resolve) => {
    let stdout = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        child.kill();
      } catch {
        // already exited — fine.
      }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish(new LagUnavailable(`aiox-core lag-mcp timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on("error", (err) => {
      finish(new LagUnavailable(`aiox-core lag-mcp process error: ${err.message}`));
    });

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      const newlineIndex = stdout.indexOf("\n");
      if (newlineIndex === -1) return;
      const line = stdout.slice(0, newlineIndex);
      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch (err) {
        finish(new LagUnavailable(`malformed response from lag-mcp: ${err.message}`));
        return;
      }
      if (parsed.error) {
        finish(new LagUnavailable(`lag-mcp error: ${parsed.error.message ?? JSON.stringify(parsed.error)}`));
        return;
      }
      const result = parsed.result;
      const isError = result?.isError === true;
      const text = result?.content?.[0]?.text;
      if (isError) {
        finish(new LagUnavailable(`lag tool ${toolName} returned isError: ${text ?? "unknown"}`));
        return;
      }
      let payload = text;
      try {
        payload = JSON.parse(text);
      } catch {
        // tool text wasn't JSON — return raw text, still a success (AC7: never crash on shape surprises).
      }
      finish(new LagResult(payload));
    });

    child.stdin.write(`${JSON.stringify(request)}\n`);
    child.stdin.end();
  });
}

/** Typed convenience wrapper — `query_graph` (AC4 of `031.W4.1`). */
export function queryGraph(args, opts) {
  return callLagTool("query_graph", args, opts);
}

/** Typed convenience wrapper — `list_adrs` (AC5 of `031.W4.1`). */
export function listAdrs(opts) {
  return callLagTool("list_adrs", {}, opts);
}

/** Typed convenience wrapper — `read_adr` (AC5 of `031.W4.1`). */
export function readAdr(adrId, opts) {
  return callLagTool("read_adr", { adr_id: adrId }, opts);
}

/** Typed convenience wrapper — `blast_radius` (AC6 of `031.W4.1`). */
export function blastRadius(args, opts) {
  return callLagTool("blast_radius", args, opts);
}

/** Typed convenience wrapper — `drift_check` (AC7 of `031.W4.1`). */
export function driftCheck(args, opts) {
  return callLagTool("drift_check", args, opts);
}

/** Typed convenience wrapper — `entity_context` (AC8 of `031.W4.1`). */
export function entityContext(args, opts) {
  return callLagTool("entity_context", args, opts);
}
