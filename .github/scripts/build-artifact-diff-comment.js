#!/usr/bin/env node
import fs from "node:fs";

const MARKER = "<!-- blob-list-artifact-diff -->";
const MAX_DIFF_CHARS = 58000;

const [, , artifactDiffPath, outputPath, chainlistDiffPath] = process.argv;

if (!artifactDiffPath || !outputPath) {
  console.error(
    "Usage: build-artifact-diff-comment.js <artifact.diff> <comment.md> [chainlist.diff]",
  );
  process.exitCode = 1;
} else {
  const artifactDiff = readOptionalFile(artifactDiffPath);
  const chainlistDiff = readOptionalFile(chainlistDiffPath);
  fs.writeFileSync(outputPath, buildComment({ artifactDiff, chainlistDiff }));
}

function buildComment({ artifactDiff, chainlistDiff }) {
  const baseSha = shortSha(process.env.BASE_SHA);
  const headSha = shortSha(process.env.HEAD_SHA);
  const headerLines = [
    MARKER,
    "## Projected generated-data diff",
    "",
    `CI generated Chainlist snapshot data and artifacts from this PR and compared them with base ${baseSha}.`,
  ];
  if (headSha) {
    headerLines.push(`Source head: ${headSha}.`);
  }
  headerLines.push("");
  const header = headerLines.join("\n");

  if (!artifactDiff.trim() && !chainlistDiff.trim()) {
    return `${header}No generated Chainlist snapshot or artifact changes.\n`;
  }

  const diff = [
    formatDiffSection("Chainlist snapshot changes", chainlistDiff),
    formatDiffSection("Artifact changes", artifactDiff),
  ]
    .filter(Boolean)
    .join("\n\n");
  const { text, truncated } = truncateAtLine(diff, MAX_DIFF_CHARS);
  const note = truncated
    ? "\n\nDiff truncated to fit in a PR comment. Download the `projected-generated-diffs` workflow artifact for the full diff.\n"
    : "\n";

  return `${header}<details open>
<summary>Generated-data changes</summary>

\`\`\`diff
${text}
\`\`\`${note}</details>
`;
}

function readOptionalFile(file) {
  return file && fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function formatDiffSection(title, diff) {
  if (!diff.trim()) {
    return "";
  }
  return `# ${title}\n${diff.trimEnd()}`;
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
