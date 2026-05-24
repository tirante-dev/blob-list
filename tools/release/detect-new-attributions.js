#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import YAML from "js-yaml";

const [, , baseRef, headRef] = process.argv;

if (!baseRef || !headRef) {
  console.error("Usage: detect-new-attributions.js <base-ref> <head-ref>");
  process.exitCode = 1;
} else {
  try {
    const baseClaims = loadClaims(baseRef);
    const headClaims = loadClaims(headRef);
    const addedClaims = [...headClaims.values()].filter(
      (claim) => !baseClaims.has(claim.key),
    );

    writeGithubOutput(
      "has_new_attributions",
      addedClaims.length > 0 ? "true" : "false",
    );
    writeGithubOutput("count", String(addedClaims.length));
    writeGithubOutput("summary", formatSummary(addedClaims));

    if (addedClaims.length > 0) {
      console.log(
        `Detected ${addedClaims.length} new attribution claim${addedClaims.length === 1 ? "" : "s"}:`,
      );
      console.log(formatSummary(addedClaims));
    } else {
      console.log("No new attribution claims detected.");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

function loadClaims(ref) {
  const claims = new Map();
  for (const file of listEntityFiles(ref)) {
    const entity = YAML.load(git(["show", `${ref}:${file}`]));
    for (const claim of entity.addresses ?? []) {
      const item = {
        address: claim.address,
        entityId: entity.id,
        file,
        key: claimKey(entity, claim),
        label: claim.label,
        role: claim.role,
        submissionChain: claim.submission_chain,
        validFromBlock: claim.valid_from?.block,
      };
      claims.set(item.key, item);
    }
  }
  return claims;
}

function listEntityFiles(ref) {
  return git(["ls-tree", "-r", "--name-only", ref, "--", "entities"])
    .split(/\r?\n/u)
    .filter((file) => /\.ya?ml$/u.test(file))
    .sort();
}

function claimKey(entity, claim) {
  return [
    entity.id,
    claim.submission_chain,
    claim.address.toLowerCase(),
    claim.role,
    claim.valid_from?.block,
  ].join("\0");
}

function formatSummary(claims) {
  if (claims.length === 0) {
    return "No new attribution claims.";
  }
  return claims
    .map(
      (claim) =>
        `- ${claim.entityId}: ${claim.label} (${claim.submissionChain} ${claim.address}, ${claim.role}, from block ${claim.validFromBlock})`,
    )
    .join("\n");
}

function writeGithubOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  if (value.includes("\n")) {
    const delimiter = `EOF_${name}`;
    fs.appendFileSync(
      outputPath,
      `${name}<<${delimiter}\n${value}\n${delimiter}\n`,
    );
  } else {
    fs.appendFileSync(outputPath, `${name}=${value}\n`);
  }
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}
