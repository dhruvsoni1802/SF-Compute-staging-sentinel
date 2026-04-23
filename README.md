# staging-sentinel

CLI that sanity-checks a staging Kubernetes cluster before you promote changes.

```bash
npm install -g staging-sentinel
staging-sentinel check
staging-sentinel check --context my-staging
```

Needs `kubectl` configured. Thresholds are hardcoded in `src/lib/config.ts` for now.
