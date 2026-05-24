# Chainlist Snapshot

`snapshot.json` is a vendored lockfile for the subset of
[`ethereum-lists/chains`](https://github.com/ethereum-lists/chains) referenced by
source entity YAML.

This file exists so validation, generation, CI, and releases are deterministic.
It is not registry-owned chain metadata, and it should not be edited by hand.
Refresh it with:

```sh
npm run fetch-chainlist
```

If the referenced upstream Chainlist data changes, the scheduled refresh
workflow opens a pull request with the updated snapshot.
