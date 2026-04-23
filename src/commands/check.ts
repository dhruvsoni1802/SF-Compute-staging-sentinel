import chalk from "chalk";
import path from "path";
import { loadConfig } from "../lib/config";
import { connectCluster, fetchNamespacesJson, fetchNodesJson } from "../lib/cluster";
import { missingNamespaces, parseNamespaceNames } from "../lib/namespaces";
import { bytesToGi, parseNodeInventory } from "../lib/nodeStats";

interface CheckOptions {
  context: string;
  config: string;
}

const LABEL_W = 24;

function formatGi(gi: number): string {
  const x = Math.round(gi * 10) / 10;
  return Number.isInteger(x) ? `${x}Gi` : `${x}Gi`;
}

function formatCores(millicores: number): string {
  const c = millicores / 1000;
  const x = Math.round(c * 10) / 10;
  return Number.isInteger(x) ? `${x}` : `${x}`;
}

export async function checkCommand(opts: CheckOptions): Promise<void> {
  let cfg;
  try {
    cfg = loadConfig(opts.config);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`${msg}\n`));
    process.exit(1);
  }

  const resolved = path.resolve(opts.config);
  if (cfg.usedFile) {
    console.log(chalk.gray(`  config  ${resolved}\n`));
  } else {
    console.log(chalk.gray(`  config  ${resolved} (file missing — defaults)\n`));
  }

  const cluster = await connectCluster(opts.context);
  const label = (s: string) => s.padEnd(LABEL_W);

  if (!cluster.connected) {
    console.log(`  ${chalk.red("✗")} ${label("cluster reachable")} ${cluster.error ?? "unknown"}\n`);
    console.log(chalk.red("FAIL — could not reach cluster"));
    process.exit(1);
  }

  const passed: boolean[] = [];

  console.log(`  ${chalk.green("✓")} ${label("cluster reachable")} ${cluster.serverUrl}`);
  passed.push(true);

  let inventory;
  try {
    inventory = parseNodeInventory(fetchNodesJson(cluster.name));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.log(`  ${chalk.red("✗")} ${label("nodes")} ${msg}\n`);
    console.log(chalk.red("FAIL — could not list nodes"));
    process.exit(1);
  }

  const { config: c } = cfg;

  const gpuOk = inventory.gpuNodeCount >= c.minGpuNodes;
  passed.push(gpuOk);
  console.log(
    `  ${gpuOk ? chalk.green("✓") : chalk.red("✗")} ${label("gpu nodes")}` +
      ` ${inventory.gpuNodeCount} found (min: ${c.minGpuNodes})`
  );

  const memGi = bytesToGi(inventory.totalMemoryBytes);
  const memOk = memGi >= c.minMemoryGb;
  passed.push(memOk);
  console.log(
    `  ${memOk ? chalk.green("✓") : chalk.red("✗")} ${label("total memory")}` +
      ` ${formatGi(memGi)} (min: ${c.minMemoryGb}Gi)`
  );

  const cores = inventory.totalCpuMillicores / 1000;
  const cpuOk = cores >= c.minCpuCores;
  passed.push(cpuOk);
  console.log(
    `  ${cpuOk ? chalk.green("✓") : chalk.red("✗")} ${label("total cpu")}` +
      ` ${formatCores(inventory.totalCpuMillicores)} cores (min: ${c.minCpuCores})`
  );

  let nsPresent: Set<string>;
  try {
    nsPresent = parseNamespaceNames(fetchNamespacesJson(cluster.name));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.log(`  ${chalk.red("✗")} ${label("namespaces")} ${msg}\n`);
    console.log(chalk.red("FAIL — could not list namespaces"));
    process.exit(1);
  }

  const missing = missingNamespaces(c.requiredNamespaces, nsPresent);
  const nsOk = missing.length === 0;
  passed.push(nsOk);
  const nsDetail = nsOk
    ? c.requiredNamespaces.join(", ")
    : `missing: ${missing.join(", ")}`;
  console.log(
    `  ${nsOk ? chalk.green("✓") : chalk.red("✗")} ${label("required namespaces")} ${nsDetail}`
  );

  const failed = passed.filter((p) => !p).length;
  console.log();
  if (failed > 0) {
    console.log(chalk.red(`FAIL — ${failed} check${failed === 1 ? "" : "s"} failed`));
    process.exit(1);
  }
  console.log(chalk.green("PASS — all checks passed"));
  process.exit(0);
}
