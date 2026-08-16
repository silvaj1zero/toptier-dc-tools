import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { classifyDesignMd } from "../scripts/classify-design-md.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function fixture(name) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

test("README-only DESIGN.md is explicit non-token documentation", () => {
  assert.deepEqual(classifyDesignMd(fixture("readme-only.md")), {
    format: "readme-only",
    tokenContract: false,
    reason: "DESIGN.md has no YAML frontmatter; treat it as non-token documentation",
  });
});

test("formal DESIGN.md retains the token-contract path", () => {
  const result = classifyDesignMd(fixture("formal-token-contract.md"));
  assert.equal(result.format, "formal-token-contract");
  assert.equal(result.tokenContract, true);
  assert.deepEqual(result.declaredKeys, ["colors", "typography", "spacing", "rounded", "modes"]);
});

test("frontmatter without token keys halts as ambiguous", () => {
  const result = classifyDesignMd("---\ntitle: Design notes\n---\n");
  assert.equal(result.format, "ambiguous-frontmatter");
  assert.equal(result.tokenContract, false);
  assert.match(result.reason, /declares none of the token keys/);
});
