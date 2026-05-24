#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const bump = process.argv[2] ?? "minor";

if (!["major", "minor", "patch"].includes(bump)) {
  console.error("Usage: next-version.js [major|minor|patch]");
  process.exitCode = 1;
} else {
  const latest = latestReleaseTag() ?? { major: 0, minor: 0, patch: 0 };
  const next = bumpVersion(latest, bump);
  const version = `v${next.major}.${next.minor}.${next.patch}`;

  writeGithubOutput("version", version);
  console.log(version);
}

function latestReleaseTag() {
  const tags = git(["tag", "--list", "v[0-9]*.[0-9]*.[0-9]*"])
    .split(/\r?\n/u)
    .map(parseVersion)
    .filter(Boolean)
    .sort(compareVersions);
  return tags.at(-1) ?? null;
}

function parseVersion(tag) {
  const match = /^v(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/u.exec(tag);
  if (!match?.groups) {
    return null;
  }
  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
  };
}

function compareVersions(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

function bumpVersion(version, releaseType) {
  if (releaseType === "major") {
    return { major: version.major + 1, minor: 0, patch: 0 };
  }
  if (releaseType === "minor") {
    return { major: version.major, minor: version.minor + 1, patch: 0 };
  }
  return {
    major: version.major,
    minor: version.minor,
    patch: version.patch + 1,
  };
}

function writeGithubOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
  });
}
