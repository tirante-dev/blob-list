# Chainlist Snapshot

`snapshot.json` is a generated lockfile for the subset of
[`ethereum-lists/chains`](https://github.com/ethereum-lists/chains) referenced by
source entity YAML.

It pins exactly which Chainlist data validation, generation, and releases ran
against. It is not registry-owned chain metadata, it should not be edited by
hand, and it is gitignored on `main`. Create it locally with:

```sh
npm run fetch-chainlist
```

CI regenerates the snapshot on every merge to `main` and on a weekly schedule,
publishing it to the machine-owned `generated-data` branch alongside the
generated artifacts.
