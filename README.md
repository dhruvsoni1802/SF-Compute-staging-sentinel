# staging-sentinel

CLI that sanity-checks a staging Kubernetes cluster before you promote changes.

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

`.github/workflows/staging-check.yml` runs on pull requests to `main`. The job fails (and blocks merge if you require this check) when `staging-sentinel check` exits non-zero.

Set **`STAGING_KUBECONFIG`** to the full kubeconfig for staging (same as pasting `~/.kube/config`). Optional **`SENTINEL_CONFIG`**: multiline YAML for `sentinel.config.yaml` when the file isn’t in the repo (local `sentinel.config.yaml` is gitignored). If both are absent, the workflow copies `sentinel.config.example.yaml` for the run.
