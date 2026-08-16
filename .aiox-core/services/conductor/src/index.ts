/**
 * @aiox/conductor — pluggable decision-routing for the AIOX Conductor.
 *
 * P1 surface:
 *   - ConductorTransport interface + HarvestResult (transport.ts)
 *   - FileProtocolTransport — adapter A, functional (file-protocol-transport.ts)
 *   - NativeIpcTransport — adapter B, skeleton/P3 (native-ipc-transport.ts)
 *   - Policy engine — classifyDecision / applyPolicy / resolvers (policy.ts)
 *   - File-protocol decision channel — read/write/watch (protocol.ts)
 *   - Circuit-breaker state — CbState (state.ts)
 */

// Decision channel (file protocol)
export {
  CONDUCTOR_DECISION_TIMEOUT_MS_DEFAULT,
  WatchResolvedTimeoutError,
  writePending,
  readPending,
  writeResolved,
  readResolved,
  hasPending,
  clearDecision,
  watchResolved,
  type PendingDecision,
  type ResolvedDecision,
  type DecisionFrom,
} from './protocol.ts';

// Circuit-breaker state
export {
  DEFAULT_MAX_INVOCATIONS,
  freshCbState,
  type CbState,
} from './state.ts';

// Policy engine
export {
  LOOPABLE_CATEGORIES,
  ALWAYS_ESCALATE_CATEGORIES,
  hasSecuritySignal,
  hasArchitectureSignal,
  hasScopeMismatchSignal,
  hasMissingDependencySignal,
  classifyDecision,
  applyPolicy,
  buildResolvedFromPolicy,
  type AutonomyLevel,
  type DecisionCategory,
  type PolicyResult,
} from './policy.ts';

// Transport contract + adapters
export {
  type ConductorTransport,
  type HarvestResult,
  type HarvestStatus,
} from './transport.ts';
export {
  FileProtocolTransport,
  type FileProtocolTransportOptions,
} from './file-protocol-transport.ts';
export {
  NativeIpcTransport,
  NotYetImplementedError,
  type NativeIpcTransportOptions,
} from './native-ipc-transport.ts';

// Conductor-side resolution loop (Fatia 1)
export {
  ConductorLoop,
  type ConductorLoopOptions,
  type ConductorEvent,
} from './conductor-loop.ts';

// F9 — agent-selection-by-domain (ADR-COCKPIT-AGENT-SELECTION): 6-gate scorer + draft-time layer
export {
  MAX_SCORE,
  COLLAPSE_THRESHOLD,
  SENSITIVE_TOKENS,
  selectExecutors,
  selectionConfidence,
  isSensitive,
  recommend,
  selectPair,
  type Executor,
  type TaskRequirements,
  type GateResult,
  type SelectionResult,
  type SelectionResponse,
  type ExecutorRegistry,
  type Recommendation,
  type PairResult,
} from './executor-selector.ts';

// F9a — registry generator/loader (frontmatter SOT → generated cache)
export {
  parseFrontmatter,
  isExecutorFrontmatter,
  buildRegistry,
  generateRegistry,
  loadRegistry,
  type Overlay,
  type OverlayEntry,
  type BuildOptions,
} from './executor-registry.ts';

// F7 — multi-CLI engine registry (ADR-COCKPIT-ENGINE-REGISTRY): the self-heal route layer
export {
  BUNDLED_ENGINES,
  defaultProber,
  loadEngines,
  probeAvailable,
  selectReviewers,
  selectLongContext,
  type EngineRole,
  type EngineConfig,
  type Prober,
  type EnginesConfigShape,
  type ReviewerSelection,
} from './engine-registry.ts';

// F7b — normalized findings (cross-engine dedupe + agreement)
export {
  normalizeSeverity,
  normalizeFinding,
  dedupeFindings,
  blockingFindings,
  severityCounts,
  verdictFromFindings,
  type Severity,
  type Verdict,
  type RawFinding,
  type NormalizedFinding,
} from './findings.ts';

// wave-execute agnostic enrichments: cascade-block + BACKLOG ids, effort calibration, flywheel delta
export {
  cascadeBlock,
  assignBacklogIds,
  calibrateEffort,
  flywheelDelta,
  type DependsOn,
  type WaveMetrics,
  type MetricChange,
} from './wave-planning.ts';

// F1 — phase-completion ACK channel (the conductor's multi-write contract)
export {
  ACK_SCHEMA_VERSION,
  ACK_PHASES,
  CLOSE_ACK_SEQUENCE,
  ackDir,
  ackPath,
  writeAck,
  readAck,
  hasAck,
  listAcks,
  isResumableMidClose,
  isSdcComplete,
  resolveAckRoot,
  emitAck,
  type AckStatus,
  type AckRecord,
  type WriteAckOptions,
  type AckEnv,
  type EmitAckOptions,
  type EmitAckResult,
} from './ack.ts';

// F3 — Channel-1 learning store (ADR-COCKPIT-LEARNING-TELEMETRY): deterministic substrate
export {
  DEFAULT_THRESHOLDS,
  DEFAULT_LEARNING_ROOT,
  logPath,
  entryPath,
  kbDirs,
  parseLearningYaml,
  emitLearningYaml,
  readEntries,
  readActiveKb,
  relevanceFilter,
  promotionCandidates,
  promote,
  writeLog,
  type LearningType,
  type LearningContext,
  type DraftEntry,
  type Heuristic,
  type StoryContext,
  type PromotionThresholds,
  type ExecutionLog,
} from './learning-store.ts';
