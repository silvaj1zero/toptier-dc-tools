---
name: update-cockpit
description: Update + relaunch the AIOX Cockpit — auto-detects the install kind. Velopack-installed app (toolbar "vX.Y.Z"): updates itself from the public feed, just close+reopen. Dev checkout (toolbar "vX.Y.Z-dev"): pull, rebuild release, relaunch via scripts/run-aiox.{sh,ps1}. The one-command "get me on the newest build" flow.
version: "2.0.0"
context: conversation
agent: general-purpose
user-invocable: true
argument-hint: "[--no-pull]"
status: active
allowed-tools: Bash
---

# /update-cockpit — Update + relaunch the cockpit (both install kinds)

Bring the AIOX Cockpit to the newest build — **one command for every update**. Since F5 (Velopack
auto-update) there are TWO install kinds with different update paths; detect which one first.

**Invocation:** `/update-cockpit` · `/update-cockpit --no-pull` (dev checkout: build + launch as-is).

## Step 0 — Detect the install kind

The toolbar version (also `app_version()` in `main.rs`) is the discriminator:

| Toolbar shows | Kind | Update path |
|---|---|---|
| `vX.Y.Z` (no suffix) | **Velopack install** (packaged app) | self-updating — Step A |
| `vX.Y.Z-dev` | **Dev checkout** (cargo build) | pull + rebuild — Step B |

No cockpit running / unsure: if the user launches from this repo's `target/release/`, it is a dev
checkout; a packaged install lives outside the repo (e.g. `%LocalAppData%` on Windows, `/Applications`
on macOS).

## Step A — Velopack install (self-updating)

1. The app already checks the public feed (`SynkraAI/aiox-cockpit-releases`) **on startup**, downloads in
   the background, and applies **silently on close**. There is nothing to build: tell the user to
   **close and reopen the app** — the toolbar version flips when the update applied.
2. Check whether the feed actually has a newer release:
   `gh release list -R SynkraAI/aiox-cockpit-releases --limit 3` — an empty feed means nothing to update
   to yet (the first real signed release awaits the code-signing certificates; see
   `docs/handoffs/2026-07-02-distribution-autoupdate.md`).
3. **Test-install gotcha (0.9.x):** the v0.9.x releases were throwaway proofs and were deleted from the
   feed. Velopack never downgrades, so an installed 0.9.x will NOT auto-update to the first real release
   (v0.1.0 < 0.9.x). Fix: uninstall the test build, reinstall from the feed once the real release exists.
4. Limits (current F5 state): the check runs **only at startup** (no periodic re-check, no "update ready"
   toast yet — pending refinements). A long-running app won't see a release published after it started;
   restart it.

## Step B — Dev checkout (pull + rebuild + relaunch)

1. **Run the platform launcher** from the repo root — it pulls `main`, builds **release**, and relaunches:
   - macOS/Linux: `bash scripts/run-aiox.sh`
   - Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-aiox.ps1`
   - `--no-pull` → set `AIOX_NO_PULL=1` for that invocation.
2. **Always build release** (CLAUDE.md gotcha: the `.app`/launcher picks the newest binary by mtime, and
   release strips the `debug_assert`s that abort in debug). The script already does `--release`; if a debug
   build is also wanted, run `cargo build -p aiox-cockpit` first.
3. **Verify** the cockpit came up: confirm the process is alive (`pgrep -f target/release/aiox-cockpit` on
   mac/Linux) and `tail /tmp/aiox.log` for any panic.
4. **Report** concisely: the commit now on `main` (`git rev-parse --short HEAD` + subject), build OK/fail,
   and cockpit alive/dead.

## Notes

- **Relaunch is safe** — session-restore (`~/.aiox-cockpit-session.json`) brings the canvas back (panes +
  layout + camera), so a relaunch is seamless even if you're working inside the cockpit.
- A pane that fails to open shows a **red spawn-error banner** with the reason; on macOS GUI launches the
  cockpit hydrates the login-shell PATH so nvm CLIs (`claude`/`codex`/`gemini`) are found.
- Auto-update is a **no-op on a dev build** (`UpdateManager::new` errors without an install context) — the
  two paths never interfere; a dev checkout always updates via Step B.
- **Do NOT touch** `crates/aiox-core/` or `integration/` (parallel-owned). This skill only pulls + builds +
  launches; it never edits those trees.
- Only `@devops` pushes — this skill does not commit/push; it just updates the local build and relaunches.
