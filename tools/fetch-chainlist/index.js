#!/usr/bin/env node
import {
  canonicalJson,
  chainlistFile,
  collectReferencedChains,
  loadEntities,
  readJson,
  writeJson,
} from "../lib/registry.js";

const DEFAULT_REPOSITORY = "ethereum-lists/chains";
const USER_AGENT = "ahkc4/blob-list chainlist fetcher";

try {
  const repository = process.env.CHAINLIST_REPO ?? DEFAULT_REPOSITORY;
  const repo = await githubJson(`https://api.github.com/repos/${repository}`);
  const ref = process.env.CHAINLIST_REF ?? repo.default_branch;
  const commit = await githubJson(
    `https://api.github.com/repos/${repository}/commits/${ref}`,
  );

  const entities = await loadEntities();
  const refs = collectReferencedChains(entities);
  const chains = {};
  const icons = {};

  for (const caip2 of refs) {
    const chainId = caip2.replace("eip155-", "");
    const chain = await rawJson(
      repository,
      commit.sha,
      `_data/chains/eip155-${chainId}.json`,
    );
    chains[caip2] = chain;
    if (chain.icon && !icons[chain.icon]) {
      icons[chain.icon] = await rawJson(
        repository,
        commit.sha,
        `_data/icons/${chain.icon}.json`,
        [],
      );
    }
  }

  const snapshot = {
    chains,
    icons,
    schema_version: 1,
    source: {
      commit: commit.sha,
      fetched_at: new Date().toISOString(),
      ref,
      repository,
      url: `https://github.com/${repository}/tree/${commit.sha}`,
    },
  };

  const previousSnapshot = await readExistingSnapshot();
  if (isSameVendoredData(previousSnapshot, snapshot)) {
    console.log(
      `Chainlist snapshot unchanged; kept ${previousSnapshot.source.repository}@${previousSnapshot.source.commit}`,
    );
  } else {
    await writeJson(chainlistFile, snapshot);
    console.log(
      `Fetched ${Object.keys(chains).length} Chainlist refs from ${repository}@${commit.sha}`,
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function readExistingSnapshot() {
  try {
    return await readJson(chainlistFile);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function isSameVendoredData(previousSnapshot, nextSnapshot) {
  if (!previousSnapshot) {
    return false;
  }
  if (previousSnapshot.source?.repository !== nextSnapshot.source?.repository) {
    return false;
  }
  return (
    canonicalJson({
      chains: previousSnapshot.chains,
      icons: previousSnapshot.icons,
      schema_version: previousSnapshot.schema_version,
    }) ===
    canonicalJson({
      chains: nextSnapshot.chains,
      icons: nextSnapshot.icons,
      schema_version: nextSnapshot.schema_version,
    })
  );
}

async function githubJson(url) {
  const response = await fetch(url, { headers: requestHeaders() });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

async function rawJson(repository, commit, file, fallback = undefined) {
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${file}`;
  const response = await fetch(url, { headers: requestHeaders() });
  if (!response.ok) {
    if (fallback !== undefined && response.status === 404) {
      return fallback;
    }
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

function requestHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}
