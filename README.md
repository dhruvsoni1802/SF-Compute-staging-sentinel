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
