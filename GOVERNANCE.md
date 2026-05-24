# Governance

This registry favors cautious, evidence-backed attribution over speed.

## Maintainer Responsibilities

- Enforce schema and CI checks before merge.
- Ask for stronger evidence when confidence is overstated.
- Preserve historical claims by closing validity ranges instead of deleting prior attributions.
- Treat disputed claims as first-class data rather than silently removing them.

## Review Policy

Attribution changes should be reviewed by at least one maintainer. Claims marked `confirmed` require strong public evidence. Claims based on analysis, dashboard labels, or explorer labels should normally use `probable` or `inferred`.

## Disputes

If an attribution is disputed, open an issue with the entity, address, block range, and counter-evidence. Maintainers may change the claim to `confidence: disputed`, close the range, or add a corrected claim while keeping the record auditable.
