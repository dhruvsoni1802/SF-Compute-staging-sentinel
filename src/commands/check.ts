import chalk from "chalk";
import { THRESHOLDS } from "../lib/config";
import { connectCluster, fetchNodesJson } from "../lib/cluster";
import { bytesToGi, parseNodeInventory } from "../lib/nodeStats";

interface CheckOptions {
  context: string;
}

const LABEL_W = 22;

function formatGi(gi: number): string {
  const x = Math.round(gi * 10) / 10;
  return Number.isInteger(x) ? `${x}Gi` : `${x}Gi`;
}

export async function checkCommand(opts: CheckOptions): Promise<void> {
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

  const gpuOk = inventory.gpuNodeCount >= THRESHOLDS.minGpuNodes;
  passed.push(gpuOk);
  console.log(
    `  ${gpuOk ? chalk.green("✓") : chalk.red("✗")} ${label("gpu nodes")}` +
      ` ${inventory.gpuNodeCount} found (min: ${THRESHOLDS.minGpuNodes})`
  );

  const memGi = bytesToGi(inventory.totalMemoryBytes);
  const memOk = memGi >= THRESHOLDS.minTotalMemoryGi;
  passed.push(memOk);
  console.log(
    `  ${memOk ? chalk.green("✓") : chalk.red("✗")} ${label("total memory")}` +
      ` ${formatGi(memGi)} (min: ${THRESHOLDS.minTotalMemoryGi}Gi)`
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
