# staging-sentinel

CLI that sanity-checks a staging Kubernetes cluster before you promote changes.

```bash
npm install -g staging-sentinel
staging-sentinel check
staging-sentinel check --context my-staging --config ./sentinel.config.yaml
```

Needs `kubectl` configured. Config file is optional for now (defaults apply if missing).
