# blob-list

`blob-list` is a public, evidence-backed registry that maps blob-submitting EVM addresses to entities. It is additive to [`ethereum-lists/chains`](https://github.com/ethereum-lists/chains): chain metadata, RPC URLs, explorers, currencies, and parent-chain relationships remain there, while this repo focuses only on attribution claims.

The registry is intended for blob explorers, dashboards, wallets, researchers, and data pipelines that need to answer: "Which entity submitted this blob transaction sender at this block?"

## What Is In Scope

- Blob-submitting EVM addresses, grouped by entity.
- Block-range validity for each attribution.
- Evidence for every address claim.
- Chain references using CAIP-2 IDs such as `eip155-1`.
- Entities that are not necessarily chains, including infrastructure providers, bridges, exchanges, research users, and individuals.

## Layout

```text
entities/          Source YAML, one file per entity.
schemas/           JSON Schemas for source and generated artifacts.
tools/             Fetch, validate, and generate scripts.
icons/local/       Local icons only for entities not represented by Chainlist.
```

Generated outputs are not committed to `main`. CI publishes them to the
machine-owned `generated-data` branch:

```text
artifacts/                     Generated JSON artifacts for consumers.
data/chainlist/snapshot.json   Pinned Chainlist snapshot the artifacts were generated from.
```

## Chainlist Snapshot

`data/chainlist/snapshot.json` is a generated lockfile for the subset of
Chainlist entries referenced by source YAML. It pins exactly which Chainlist
data each publish and release was generated from; it is not registry-owned
chain metadata. Create it locally with `npm run fetch-chainlist`; CI refreshes
the published copy on every merge to `main` and on a weekly schedule.

## Consumer Lookup

1. Load `artifacts/by-chain/{submission_chain}.json` from a stable URL:
   - Always current: `https://raw.githubusercontent.com/tirante-dev/blob-list/generated-data/artifacts/by-chain/{submission_chain}.json`
   - Latest release: `https://github.com/tirante-dev/blob-list/releases/latest/download/{submission_chain}.json`
2. Normalize the transaction sender to a checksummed EVM address.
3. Find address claims for that sender.
4. Filter claims by block number.
5. Prefer active, non-disputed, highest-confidence claims.
6. Display the entity name, role, confidence, chain refs, and icon metadata.

## Development

```sh
npm ci
npm run fetch-chainlist
npm run generate
npm run validate
```

Before opening a pull request, run:

```sh
npm run format:check
npm run lint:md
npm run generate
npm run validate
npm run generate:check
```

Pull request CI regenerates artifacts from the submitted source files and posts
the projected Chainlist snapshot and artifact diff as a PR comment, compared
against the published `generated-data` branch. Attribution PRs should include
source YAML, schemas, docs, or icons only; `artifacts/` and
`data/chainlist/snapshot.json` are gitignored, and CI rejects any PR that
commits them. After a merge to `main`, CI regenerates the dataset and publishes
it directly to the `generated-data` branch — no bot pull requests are involved,
so every PR to `main` gets a human review.

## Releases

Dataset releases use semver-style tags. Merges to `main` that add one or
more address attribution claims automatically publish the next minor release.
Manual tag pushes matching `v*.*.*` can still publish explicit releases for
schema changes or patch fixes.

- Major: schema changes.
- Minor: new entities, chains, or attribution claims.
- Patch: metadata, evidence, typo, or icon fixes.

Release artifacts include generated JSON files and SHA256 checksums.
