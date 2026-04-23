# staging-sentinel

Small **`kubectl`** helper: config in YAML, few checks on the cluster, exits 0 or 1. I use it so staging doesn’t quietly drift and we only find out in prod.

## See it in Actions

**Actions** → **“Demo (Kind — public CI, no secrets)”**. Kind comes up in CI, we run the check; GPU fails on purpose (no GPUs there). Job stays green anyway—`continue-on-error`—so the badge isn’t stuck red.

[![Demo](https://github.com/dhruvsoni1802/SF-Compute-staging-sentinel/actions/workflows/demo-kind.yml/badge.svg)](https://github.com/dhruvsoni1802/SF-Compute-staging-sentinel/actions/workflows/demo-kind.yml)

## Run it

```bash
npm ci && npm run build
node dist/index.js check --config sentinel.config.yaml
```

Needs **`kubectl`**. **`--context`** if you want a non-default context. Copy **`sentinel.config.example.yaml`** to **`sentinel.config.yaml`** (gitignored). No file → defaults in code.

## Real staging

**`staging-check.yml`**: add **`STAGING_KUBECONFIG`**, optionally **`SENTINEL_CONFIG`**, uncomment **`pull_request`** when ready. Starts as **`workflow_dispatch`** only. Branch protection is on you if merges should block on red.
