# Agent Guide

This repository is a public, chainlist-aware registry of blob-submitting EVM address attributions. Keep changes evidence-backed, deterministic, and additive.

## Core Rules

- Do not add attribution claims without public evidence.
- Do not invent chain metadata. Chain IDs, names, RPCs, explorers, currencies, icons, and related chain metadata belong to `ethereum-lists/chains`.
- Keep one source YAML file per entity in `entities/`, with the filename matching the entity `id`.
- Preserve history by closing ranges with `valid_to.block` instead of rewriting past claims.
- Use `confidence: confirmed` only for strong evidence such as official docs, official announcements, verified contracts, official repositories, or equivalent public sources.
- Use `probable`, `inferred`, or `disputed` when evidence is weaker or contested.

## Common Commands

```sh
npm ci
npm run fetch-chainlist
npm run generate
npm run format:check
npm run lint:md
npm run validate
npm run generate:check
npm audit --audit-level=moderate
```

Run `npm run fetch-chainlist` and `npm run generate` after changing `entities/`, schemas, or generator logic. Generated outputs (`artifacts/`, `data/chainlist/snapshot.json`) are gitignored and never committed to `main`; CI posts the projected generated-data diff on each PR and publishes the dataset to the machine-owned `generated-data` branch after merge.

## Data Model Notes

- `submission_chain` and all chain references use CAIP-2 refs such as `eip155-1`.
- `data/chainlist/snapshot.json` is a generated Chainlist lockfile pinning what artifacts were generated from; it lives on the `generated-data` branch, not `main`, and is not registry-owned chain metadata.
- EVM addresses must be checksummed.
- Every address claim needs at least one evidence item.
- `valid_to: null` means the claim is open-ended.
- The overlap rule is enforced: the same `submission_chain + address + role` cannot map to two active non-disputed entities over overlapping block ranges.

## Repository Hygiene

- Keep `AGENTS.md` as a symlink to this file.
- Prefer small PRs with focused attribution or tooling changes.
- The protected `main` branch requires a PR, one approving review, and the `validate` CI check.
- Automation never opens PRs against `main`; generated data is published directly to the unprotected `generated-data` branch by CI.
- Do not bypass branch protection for ordinary changes.
