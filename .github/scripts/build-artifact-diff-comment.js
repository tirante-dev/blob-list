#!/usr/bin/env node
import fs from "node:fs";

const MARKER = "<!-- blob-list-artifact-diff -->";
const MAX_DIFF_CHARS = 58000;

const [, , diffPath, outputPath] = process.argv;

if (!diffPath || !outputPath) {
  console.error(
    "Usage: build-artifact-diff-comment.js <artifact.diff> <comment.md>",
  );
  process.exitCode = 1;
} else {
  const diff = fs.existsSync(diffPath) ? fs.readFileSync(diffPath, "utf8") : "";
  fs.writeFileSync(outputPath, buildComment(diff));
}

function buildComment(diff) {
  const baseSha = shortSha(process.env.BASE_SHA);
  const headSha = shortSha(process.env.HEAD_SHA);
  const headerLines = [
    MARKER,
    "## Projected artifact diff",
    "",
    `CI generated artifacts from this PR and compared them with base ${baseSha}.`,
  ];
  if (headSha) {
    headerLines.push(`Source head: ${headSha}.`);
  }
  headerLines.push("");
  const header = headerLines.join("\n");

  if (!diff.trim()) {
    return `${header}No generated artifact changes.\n`;
  }

  const { text, truncated } = truncateAtLine(diff, MAX_DIFF_CHARS);
  const note = truncated
    ? "\n\nDiff truncated to fit in a PR comment. Download the `projected-artifact-diff` workflow artifact for the full diff.\n"
    : "\n";

  return `${header}<details open>
<summary>Generated artifact changes</summary>

\`\`\`diff
${text}
\`\`\`${note}</details>
`;
}

function shortSha(value) {
  return value ? `\`${value.slice(0, 7)}\`` : "";
}

function truncateAtLine(value, limit) {
  if (value.length <= limit) {
    return { text: value, truncated: false };
  }

  const slice = value.slice(0, limit);
  const lastNewline = slice.lastIndexOf("\n");
  return {
    text: slice.slice(0, lastNewline > 0 ? lastNewline : limit),
    truncated: true,
  };
}
