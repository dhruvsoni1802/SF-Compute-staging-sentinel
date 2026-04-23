# staging-sentinel

CLI that sanity-checks a staging Kubernetes cluster before you promote changes.

**Demo (Kind on GitHub Actions):** the workflow below runs on every push/PR to `main` using a real in-runner cluster — no secrets. The sentinel run **fails the GPU check on purpose** (kind has no `nvidia.com/gpu` nodes); that shows the gate doing its job. The workflow still shows **green** so the repo badge stays healthy (`continue-on-error` on that step).

[![Kind cluster demo](https://github.com/dhruvsoni1802/SF-Compute-staging-sentinel/actions/workflows/demo-kind.yml/badge.svg)](https://github.com/dhruvsoni1802/SF-Compute-staging-sentinel/actions/workflows/demo-kind.yml)

Replace `your-org` in the badge URL with your GitHub user or organization.

```bash
npm install -g staging-sentinel
staging-sentinel check
staging-sentinel check --context my-staging --config ./sentinel.config.yaml
```

Needs `kubectl` configured.

## Config

Copy `sentinel.config.example.yaml` to `sentinel.config.yaml` (or pass `--config`). If the file is missing, built-in defaults apply — no recompile needed to tune a file that exists.

`minMemoryGb` is compared against total **allocatable** memory on all nodes, shown in **GiB** (same basis as Kubernetes node quantities). `minCpuCores` is compared against summed **allocatable** CPU (cores). `requiredNamespaces` must all exist in the cluster.

## CI (GitHub Actions)

- **`demo-kind.yml`** — public demo: [helm/kind-action](https://github.com/helm/kind-action) + `node dist/index.js check --config demo/sentinel.kind.yaml`. No secrets.
- **`staging-check.yml`** — **template** for a real staging cluster: add **`STAGING_KUBECONFIG`**, uncomment **`pull_request`** in that file, and use **`workflow_dispatch`** until secrets exist so forks without credentials do not fail every PR.

For the real gate, set **`STAGING_KUBECONFIG`** to the full kubeconfig for staging. Optional **`SENTINEL_CONFIG`**: multiline YAML for `sentinel.config.yaml` when the file isn’t in the repo (local `sentinel.config.yaml` is gitignored). If both are absent in that workflow, it copies `sentinel.config.example.yaml` for the run.
