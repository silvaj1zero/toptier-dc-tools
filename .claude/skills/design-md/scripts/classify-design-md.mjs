#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN_KEYS = ["colors", "typography", "spacing", "rounded", "modes"];

export function classifyDesignMd(source) {
  const normalized = source.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n") && !normalized.startsWith("---\r\n")) {
    return {
      format: "readme-only",
      tokenContract: false,
      reason: "DESIGN.md has no YAML frontmatter; treat it as non-token documentation",
    };
  }

  const lines = normalized.split(/\r?\n/);
  const closing = lines.indexOf("---", 1);
  if (closing === -1) {
    return {
      format: "ambiguous-frontmatter",
      tokenContract: false,
      reason: "DESIGN.md starts YAML frontmatter but has no closing delimiter",
    };
  }

  const frontmatter = lines.slice(1, closing);
  const declaredKeys = TOKEN_KEYS.filter((key) =>
    frontmatter.some((line) => new RegExp(`^${key}\\s*:`).test(line)),
  );
  if (declaredKeys.length === 0) {
    return {
      format: "ambiguous-frontmatter",
      tokenContract: false,
      reason: `YAML frontmatter declares none of the token keys: ${TOKEN_KEYS.join(", ")}`,
    };
  }

  return {
    format: "formal-token-contract",
    tokenContract: true,
    declaredKeys,
    reason: "YAML frontmatter declares formal token keys",
  };
}

function main() {
  const input = process.argv[2];
  if (!input) {
    process.stderr.write("Usage: classify-design-md.mjs <DESIGN.md>\n");
    process.exitCode = 2;
    return;
  }

  try {
    const result = classifyDesignMd(readFileSync(resolve(input), "utf8"));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (result.format === "ambiguous-frontmatter") process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`Cannot classify DESIGN.md: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
