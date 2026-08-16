---
paths:
  - "**"
---

# Portable Paths — AIOX Cockpit

Applies to any repo-authored artifact: rules, skills, scripts, docs, and generated outputs committed to the repository.

## Non-Negotiable Rule

**Never commit machine-specific absolute paths.**

Forbidden examples:
- `/Users/<user>/project/...`
- `/home/<user>/project/...`
- `C:\Users\<user>\project\...`
- `file:///Users/<user>/project/...`

These paths are local machine state, not part of the product.

## What to use instead

**Inside the repo** — repo-relative paths (`crates/aiox-cockpit/src/main.rs`, `packaging/`, `docs/`).

**In scripts/build** — resolve at runtime:
- Rust: `env!("CARGO_MANIFEST_DIR")`, `std::env::current_dir()`, `option_env!`.
- Shell: `$(git rev-parse --show-toplevel)`, `$PWD`, `$CLAUDE_PROJECT_DIR`.

**In examples/docs** — portable placeholders: `/path/to/file`, `<repo-root>/...`, `~/...`.

## Generated artifacts

Generated files committed to the repo MUST also be portable — repo-relative paths or a `<repo-root>` placeholder, never the author's machine path.

## Note

Historical archives may contain old absolute paths — that is not permission to add new ones. Normalize any absolute path you find in files you edit.
