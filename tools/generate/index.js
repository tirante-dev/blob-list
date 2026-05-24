#!/usr/bin/env node
import {
  assertArtifactsFresh,
  buildArtifacts,
  loadChainlistSnapshot,
  loadEntities,
  writeArtifacts,
} from "../lib/registry.js";

const check = process.argv.includes("--check");

try {
  const entities = await loadEntities();
  const chainlist = await loadChainlistSnapshot();
  const artifacts = buildArtifacts(entities, chainlist);

  if (check) {
    await assertArtifactsFresh(artifacts);
  } else {
    await writeArtifacts(artifacts);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
