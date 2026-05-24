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
data/chainlist/    Pinned Chainlist snapshot used by CI.
artifacts/         Generated JSON artifacts for consumers.
icons/local/       Local icons only for entities not represented by Chainlist.
```

## Consumer Lookup

1. Load `artifacts/by-chain/{submission_chain}.json`.
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
npm run validate
npm run generate:check
```

## Releases

Dataset releases use semver-style tags.

- Major: schema changes.
- Minor: new entities, chains, or attribution claims.
- Patch: metadata, evidence, typo, or icon fixes.

Release artifacts include generated JSON files and SHA256 checksums.
