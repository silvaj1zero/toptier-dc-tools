/**
 * protocol.ts — File-protocol decision channel for the AIOX Conductor.
 *
 * The Conductor lets an orchestrator route a spawned child's blocking decisions
 * (e.g. "proceed with development?", a quality-gate concern) to either an
 * autonomous policy or a human, without the child stalling. The transport is
 * pluggable (see transport.ts); THIS module is the portable file-protocol
 * substrate that ships first.
 *
 * Channel paths (rooted at an arbitrary rootDir — never hardcoded):
 *   .sdc-decision/<spawnId>/pending.json     — child writes (question to Conductor)
 *   .sdc-resolution/<spawnId>/resolved.json   — Conductor writes (answer to child)
 *
 * DECISION CHANNEL: file-protocol ONLY. Process-liveness detection (if any)
 * lives in the transport, never here — this module carries decision semantics.
 *
 * Atomicity: all writes use tmp+rename, so readers never observe a partial file.
 *
 * watchResolved() is an fs.watch-based, event-driven utility to detect
 * resolved.json arrival (no polling). On timeout it rejects with a typed
 * WatchResolvedTimeoutError carrying spawnId + timeoutMs for diagnostics.
 *
 * Ported verbatim (logic byte-equivalent) from the SINKRA Hub mux-adapter and
 * sanitized of hub-specific names. The file-protocol shapes and validation are
 * unchanged — they are the wire contract.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Default timeout (ms) for watchResolved() when no opts.timeoutMs is provided and
 * the CONDUCTOR_DECISION_TIMEOUT_MS env var is absent or invalid.
 *
 * Configurable at runtime via env var CONDUCTOR_DECISION_TIMEOUT_MS.
 */
export const CONDUCTOR_DECISION_TIMEOUT_MS_DEFAULT = 120_000;

/**
 * Resolve the effective watchResolved timeout from the env var
 * CONDUCTOR_DECISION_TIMEOUT_MS, falling back to the module constant above.
 *
 * Validation: env value must parse to a positive integer; anything else is ignored.
 */
function resolveDefaultTimeoutMs(): number {
  const raw = process.env['CONDUCTOR_DECISION_TIMEOUT_MS'];
  if (raw !== undefined) {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return CONDUCTOR_DECISION_TIMEOUT_MS_DEFAULT;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sender of a pending decision request (recipient disambiguation). */
export type DecisionFrom = 'team-lead' | 'sub-executor';

/**
 * Schema for .sdc-decision/<spawnId>/pending.json
 * Written by the child session when a decision is needed.
 * `from` is MANDATORY — a pending.json without `from` is invalid and ignored.
 */
export interface PendingDecision {
  from: DecisionFrom;
  story_id: string;
  question: string;
  options: string[];
  ts: string;          // ISO8601
  conductor_version: string;
}

/**
 * Schema for .sdc-resolution/<spawnId>/resolved.json
 * Written by the Conductor (or human escalation handler) in response to a pending decision.
 *
 * resolved_by = 'human'  — Conductor escalated the decision to a human.
 * resolved_by = 'policy' — the autonomous policy resolved it (see policy.ts).
 */
export interface ResolvedDecision {
  selected: string | null;
  instruction: string | null;
  resolved_by: 'human' | 'policy';
  policy: string | null;             // policy name when resolved_by='policy'; null otherwise
  escalated: boolean;
  ts: string;           // ISO8601
  conductor_version: string;
}

/**
 * Typed error thrown by watchResolved() when the timeout elapses before
 * resolved.json appears. Carries `storyId` (the spawnId) and `timeoutMs`.
 *
 * Caller responsibility: on timeout the child MUST
 *   (a) emit timeout telemetry,
 *   (b) HALT (do not continue),
 *   (c) surface the timeout to the operator.
 * The child MUST NOT fall back to a re-intercepted prompt (infinite loop).
 */
export class WatchResolvedTimeoutError extends Error {
  /** The spawn that was waiting for resolution. */
  readonly storyId: string;
  /** The configured timeout in milliseconds that elapsed. */
  readonly timeoutMs: number;

  constructor(storyId: string, timeoutMs: number) {
    super(
      `watchResolved timeout: resolved.json not written within ${timeoutMs}ms for spawn "${storyId}"`,
    );
    this.name = 'WatchResolvedTimeoutError';
    this.storyId = storyId;
    this.timeoutMs = timeoutMs;
    // Maintain proper prototype chain in all transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const CONDUCTOR_VERSION = '1.0';

/**
 * Write data atomically via tmp+rename. Guarantees readers never see a partial write.
 * On rename failure the .tmp file is unlinked (best-effort) to avoid orphans on
 * cross-device renames or permission errors.
 */
function atomicWrite(filePath: string, data: unknown): void {
  const tmpPath = `${filePath}.tmp`;
  const content = JSON.stringify(data, null, 2);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmpPath, content, 'utf8');
  try {
    fs.renameSync(tmpPath, filePath);
  } catch (renameErr) {
    // Cleanup orphaned .tmp on rename failure (cross-device move or permission error).
    try { fs.unlinkSync(tmpPath); } catch (_) { /* best-effort */ }
    throw renameErr;
  }
}

/**
 * Parse JSON from a file, returning null on any error (missing, corrupt, invalid JSON).
 * Callers treat null as "not present or invalid" — never throws.
 */
function safeReadJson(filePath: string): unknown {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Sanitize a spawnId before using it in path.join to prevent path traversal.
 *
 * - Must match /^[\w.\-]+$/ — alphanumerics, dots, hyphens, underscores only.
 * - Rejects: '..', '../etc', '/etc/passwd', 'a/b', 'a\\b', empty string.
 *
 * Using an allowlist regex (not path.basename) because basename silently strips
 * leading path components, allowing 'sub/dir/id' to write into a sub-directory.
 */
function sanitizeStoryId(storyId: string): string {
  if (!/^[\w.\-]+$/.test(storyId)) {
    throw new Error(
      `conductor-protocol: invalid spawnId ${JSON.stringify(storyId)} — ` +
      `must match /^[\\w.\\-]+$/ (no path separators, traversal, or empty)`,
    );
  }
  return storyId;
}

/** Build the path for pending.json given a rootDir and spawnId. */
function pendingPath(rootDir: string, storyId: string): string {
  return path.join(rootDir, '.sdc-decision', sanitizeStoryId(storyId), 'pending.json');
}

/** Build the path for resolved.json given a rootDir and spawnId. */
function resolvedPath(rootDir: string, storyId: string): string {
  return path.join(rootDir, '.sdc-resolution', sanitizeStoryId(storyId), 'resolved.json');
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validate that a parsed object conforms to PendingDecision schema.
 * `from` is mandatory — absence makes the decision invalid.
 */
function validatePending(raw: unknown): PendingDecision | null {
  if (raw === null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  // from is MANDATORY — missing or wrong value = invalid
  if (obj['from'] !== 'team-lead' && obj['from'] !== 'sub-executor') return null;
  if (typeof obj['story_id'] !== 'string' || !obj['story_id']) return null;
  if (typeof obj['question'] !== 'string' || !obj['question']) return null;
  // options must be a non-empty array — a decision with zero choices cannot be resolved
  if (!Array.isArray(obj['options']) || obj['options'].length === 0) return null;
  if (typeof obj['ts'] !== 'string' || !obj['ts']) return null;
  if (typeof obj['conductor_version'] !== 'string') return null;

  return obj as unknown as PendingDecision;
}

/**
 * Validate that a parsed object conforms to ResolvedDecision schema.
 */
function validateResolved(raw: unknown): ResolvedDecision | null {
  if (raw === null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  // selected and instruction may be null; both keys must be present for a meaningful resolution
  if (!('selected' in obj) || !('instruction' in obj)) return null;
  if (obj['resolved_by'] !== 'human' && obj['resolved_by'] !== 'policy') return null;
  if (typeof obj['escalated'] !== 'boolean') return null;
  if (typeof obj['ts'] !== 'string' || !obj['ts']) return null;
  if (typeof obj['conductor_version'] !== 'string') return null;

  return obj as unknown as ResolvedDecision;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Write .sdc-decision/<spawnId>/pending.json atomically.
 * The `payload.from` field is required; call sites must always supply it.
 */
export function writePending(
  rootDir: string,
  storyId: string,
  payload: Omit<PendingDecision, 'conductor_version' | 'ts'> & { ts?: string; conductor_version?: string },
): void {
  const data: PendingDecision = {
    conductor_version: CONDUCTOR_VERSION,
    ts: new Date().toISOString(),
    ...payload,
  };
  atomicWrite(pendingPath(rootDir, storyId), data);
}

/**
 * Read and validate .sdc-decision/<spawnId>/pending.json.
 * Returns null if the file is absent, unreadable, or fails schema validation.
 */
export function readPending(rootDir: string, storyId: string): PendingDecision | null {
  const raw = safeReadJson(pendingPath(rootDir, storyId));
  return validatePending(raw);
}

/**
 * Write .sdc-resolution/<spawnId>/resolved.json atomically.
 */
export function writeResolved(
  rootDir: string,
  storyId: string,
  payload: Omit<ResolvedDecision, 'conductor_version' | 'ts'> & { ts?: string; conductor_version?: string },
): void {
  const data: ResolvedDecision = {
    conductor_version: CONDUCTOR_VERSION,
    ts: new Date().toISOString(),
    ...payload,
  };
  atomicWrite(resolvedPath(rootDir, storyId), data);
}

/**
 * Read and validate .sdc-resolution/<spawnId>/resolved.json.
 * Returns null if the file is absent, unreadable, or fails schema validation.
 */
export function readResolved(rootDir: string, storyId: string): ResolvedDecision | null {
  const raw = safeReadJson(resolvedPath(rootDir, storyId));
  return validateResolved(raw);
}

/**
 * Check if a pending decision exists for a spawn without reading its content.
 * Useful for fast polling in the Conductor loop.
 */
export function hasPending(rootDir: string, storyId: string): boolean {
  return fs.existsSync(pendingPath(rootDir, storyId));
}

/**
 * Remove pending.json, resolved.json, and (if present) consumed.json for a spawn.
 * Silent no-op if files don't exist.
 *
 * clearDecision checks for a `consumed.json` marker before deleting `resolved.json`.
 * If `consumed.json` is absent, the child has not yet read the resolution (race
 * between watchResolved timeout and human decision arrival). In that case
 * `resolved.json` is preserved so a later delivery can still occur. The file is
 * only deleted once `consumed.json` exists (proving delivery to the child).
 *
 * Consumption marker path: `<rootDir>/.sdc-decision/<spawnId>/consumed.json`
 */
export function clearDecision(rootDir: string, storyId: string): void {
  const safeId = sanitizeStoryId(storyId);
  const pPath = pendingPath(rootDir, storyId);
  const rPath = resolvedPath(rootDir, storyId);
  const consumedPath = path.join(rootDir, '.sdc-decision', safeId, 'consumed.json');

  // Always remove pending.json — it is no longer needed once clearDecision is called.
  if (fs.existsSync(pPath)) fs.unlinkSync(pPath);

  // Only remove resolved.json if the child confirmed consumption via consumed.json.
  const isConsumed = fs.existsSync(consumedPath);
  if (isConsumed) {
    if (fs.existsSync(rPath)) fs.unlinkSync(rPath);
    try { fs.unlinkSync(consumedPath); } catch (_) { /* best-effort */ }
  }
  // If !isConsumed: resolved.json is intentionally preserved.
}

/**
 * Watch for `.sdc-resolution/<spawnId>/resolved.json` using `fs.watch` (event-driven).
 *
 * Returns a Promise that resolves with the validated ResolvedDecision when the file
 * appears (or is renamed/changed). Rejects with `WatchResolvedTimeoutError` if the
 * effective timeoutMs elapses without a valid resolved.json. The FSWatcher is closed
 * in BOTH resolve and reject paths (no leak).
 *
 * Timeout resolution:
 *   1. `opts.timeoutMs` (explicit caller value — highest priority)
 *   2. `CONDUCTOR_DECISION_TIMEOUT_MS` env var (integer > 0)
 *   3. `CONDUCTOR_DECISION_TIMEOUT_MS_DEFAULT` (120000ms)
 *
 * fs.watch behavior differences (macOS FSEvents vs Linux inotify) are handled by
 * watching the DIRECTORY and checking the filename parameter, so the file need not
 * exist when watchResolved() is called. If the watcher fires but read/validate fails
 * (e.g. the tmp phase of atomicWrite), we wait for the next event rather than reject.
 */
export function watchResolved(
  rootDir: string,
  storyId: string,
  opts?: { timeoutMs?: number },
): Promise<ResolvedDecision> {
  // Resolve the effective timeout: explicit opts.timeoutMs → env var → default constant.
  const effectiveTimeoutMs: number =
    (opts?.timeoutMs !== undefined && opts.timeoutMs > 0)
      ? opts.timeoutMs
      : resolveDefaultTimeoutMs();

  const safe = sanitizeStoryId(storyId);
  const resDir = path.join(rootDir, '.sdc-resolution', safe);
  const resFile = path.join(resDir, 'resolved.json');

  return new Promise<ResolvedDecision>((resolve, reject) => {
    let watcher: fs.FSWatcher | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    const cleanup = () => {
      if (watcher !== null) {
        try { watcher.close(); } catch (_) { /* best-effort */ }
        watcher = null;
      }
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const tryResolve = () => {
      if (settled) return;
      const raw = safeReadJson(resFile);
      const resolved = validateResolved(raw);
      if (resolved !== null) {
        settled = true;
        cleanup();
        resolve(resolved);
      }
      // If not valid yet (e.g., tmp file from atomicWrite), wait for next event.
    };

    // Ensure the directory exists so fs.watch does not throw ENOENT immediately.
    try {
      fs.mkdirSync(resDir, { recursive: true });
    } catch (_) { /* may already exist — OK */ }

    // Check if resolved.json already exists before starting the watcher
    // (handles the race where the file was written before watchResolved() was called).
    const existing = safeReadJson(resFile);
    if (validateResolved(existing) !== null) {
      resolve(existing as ResolvedDecision);
      return;
    }

    // On expiry, reject with WatchResolvedTimeoutError (typed). Never resolves silently.
    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new WatchResolvedTimeoutError(storyId, effectiveTimeoutMs));
    }, effectiveTimeoutMs);

    try {
      watcher = fs.watch(resDir, { persistent: false }, (_event, filename) => {
        // Accept both 'rename' (file creation) and 'change' (content update).
        if (filename === 'resolved.json' || filename === null) {
          tryResolve();
        }
      });

      watcher.on('error', (err) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      });
    } catch (watchErr) {
      // fs.watch can throw if the directory disappeared between mkdirSync and watch call.
      if (settled) return;
      settled = true;
      cleanup();
      reject(watchErr);
    }
  });
}
